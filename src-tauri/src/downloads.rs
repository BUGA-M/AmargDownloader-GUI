use serde::{Deserialize, Serialize};
use serde_json; // for json! macro payloads
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;
use std::time::Duration;
use tauri::{command, AppHandle, Emitter, Manager};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt; // for creation_flags

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoDownload {
    pub url: String,
    pub video_name: String,
    pub format: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DownloadResult {
    pub url: String,
    pub status: String,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MultiDownloadProgress {
    pub total: usize,
    pub completed: usize,
    pub current_url: String,
    pub results: Vec<DownloadResult>,
}

// -------------------------------
// Helpers
// -------------------------------

#[cfg(target_os = "windows")]
const YT_DLP_BIN: &str = "yt-dlp.exe";
#[cfg(not(target_os = "windows"))]
const YT_DLP_BIN: &str = "yt-dlp";

#[cfg(target_os = "windows")]
const FFMPEG_BIN: &str = "ffmpeg.exe";
#[cfg(not(target_os = "windows"))]
const FFMPEG_BIN: &str = "ffmpeg";

fn resolve_resource_bin(handle: &AppHandle, bin: &str) -> Result<std::path::PathBuf, String> {
    // Tentative du dossier resources (après bundling)
    if let Ok(dir) = handle.path().resource_dir() {
        let path = dir.join("resources") .join(bin); //  enlever .join("resources") si ca ne marche pas
        if path.exists() {
            return Ok(path);
        }
    }

    // Fallback pendant le dev (binaire cible)
    let dev_path = std::env::current_exe()
        .map_err(|e| format!("Impossible d'obtenir current_exe: {e}"))?
        .parent()
        .unwrap()
        .join("resources") 
        .join(bin);

    if dev_path.exists() {
        return Ok(dev_path);
    }

    Err(format!("{} introuvable ni dans resources ni à {:?}", bin, dev_path))
}


/// Fallback dossier pour la sortie si vous n'avez pas votre helper `get_amarg_folder_path()`
fn default_output_dir() -> Result<String, String> {
    let dir = dirs_next::download_dir()
        .or_else(|| dirs_next::home_dir())
        .ok_or_else(|| "Impossible de déterminer un dossier de sortie".to_string())?;
    let p = dir.join("Downloads");
    std::fs::create_dir_all(&p).map_err(|e| format!("Impossible de créer le dossier: {e}"))?;
    Ok(p.to_string_lossy().to_string())
}

// -------------------------------
// 1) Version NON-BLOCKING (threads système)
// -------------------------------
#[command]
pub async fn multi_vd_dwl_non_blocking(
    handle: AppHandle,
    videos: Vec<VideoDownload>,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    format: Option<String>,
    max_concurrent: Option<usize>,
) -> Result<Vec<DownloadResult>, String> {
    if videos.is_empty() {
        return Err("Aucune vidéo à télécharger".to_string());
    }

    let max_concurrent = max_concurrent.unwrap_or(3);
    let total_videos = videos.len();

    // Canal pour recevoir les résultats
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<DownloadResult>();

    println!("Début du téléchargement de {} vidéo(s)", total_videos);

    // Traitement par chunks mais avec des threads système
    for chunk in videos.chunks(max_concurrent) {
        let mut thread_handles = Vec::new();

        for video in chunk {
            let handle_clone = handle.clone();
            let url = video.url.clone();
            let video_name = video.video_name.clone();
            let no_part_clone = no_part;
            let ignore_errors_clone = ignore_errors;
            let concurrent_fragments_clone = concurrent_fragments.clone();
            let output_path_clone = output_path.clone();
            let format_clone = format.clone();
            let tx_clone = tx.clone();

            let thread_handle = thread::spawn(move || {
                // Runtime tokio local à ce thread
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .expect("Failed to create tokio runtime");

                let result = rt.block_on(async {
                    one_vd_dwl(
                        handle_clone,
                        url.clone(),
                        video_name,
                        no_part_clone,
                        ignore_errors_clone,
                        concurrent_fragments_clone,
                        output_path_clone,
                        format_clone,
                    )
                    .await
                });

                let download_result = match result {
                    Ok(path) => {
                        let status = if path.contains("Déjà téléchargé") {
                            "already_downloaded"
                        } else if path == "server issue" {
                            "server_error"
                        } else if path == "url not found or expired" {
                            "not_found"
                        } else if path == "cnx error" {
                            "connection_error"
                        } else {
                            "success"
                        };

                        DownloadResult {
                            url,
                            status: status.to_string(),
                            path: if status == "success" || status == "already_downloaded" {
                                Some(path)
                            } else {
                                None
                            },
                            error: None,
                        }
                    }
                    Err(error) => DownloadResult {
                        url,
                        status: "error".to_string(),
                        path: None,
                        error: Some(error),
                    },
                };

                let _ = tx_clone.send(download_result);
            });

            thread_handles.push(thread_handle);
        }

        for thread_handle in thread_handles {
            let _ = thread_handle.join();
        }

        // Petit délai entre les chunks
        thread::sleep(Duration::from_millis(500));
    }

    drop(tx); // fermeture de l'émetteur pour terminer le `rx`

    // Collecte de tous les résultats
    let mut final_results = Vec::new();
    while let Some(result) = rx.recv().await {
        println!("Téléchargement terminé pour {}: {}", result.url, result.status);
        final_results.push(result);
    }

    let success_count = final_results.iter().filter(|r| r.status == "success").count();
    println!(
        "Téléchargement terminé: {}/{} réussis",
        success_count, total_videos
    );

    Ok(final_results)
}

// -------------------------------
// 2) Version ULTRA-LÉGÈRE (arrière-plan)
// -------------------------------
#[command]
pub async fn start_multi_download_background(
    handle: AppHandle,
    videos: Vec<VideoDownload>,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    max_concurrent: Option<usize>,
) -> Result<String, String> {
    if videos.is_empty() {
        return Err("Aucune vidéo à télécharger".to_string());
    }

    let download_id = uuid::Uuid::new_v4().to_string();
    let download_id_clone = download_id.clone();
    let max_concurrent = max_concurrent.unwrap_or(3);

    // compteur atomique de progression
    let completed_atomic = Arc::new(AtomicUsize::new(0));

    let handle_thread = handle.clone();
    thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("Failed to create tokio runtime");

        rt.block_on(async move {
            let total_videos = videos.len();

            println!(
                "[{}] Début du téléchargement de {} vidéo(s)",
                download_id_clone, total_videos
            );

            for chunk in videos.chunks(max_concurrent) {
                let mut thread_handles = Vec::new();

                for video in chunk {
                    let handle_clone = handle_thread.clone();
                    let url = video.url.clone();
                    let video_name = video.video_name.clone();
                    let no_part_clone = no_part;
                    let ignore_errors_clone = ignore_errors;
                    let concurrent_fragments_clone = concurrent_fragments.clone();
                    let output_path_clone = output_path.clone();
                    let format_clone = video.format.clone();
                    let download_id_thread = download_id_clone.clone();
                    let completed_clone = completed_atomic.clone();

                    let thread_handle = thread::spawn(move || {
                        let rt = tokio::runtime::Builder::new_current_thread()
                            .enable_all()
                            .build()
                            .expect("Failed to create tokio runtime");

                        rt.block_on(async move {
                            let result = one_vd_dwl(
                                handle_clone.clone(),
                                url.clone(),
                                video_name,
                                no_part_clone,
                                ignore_errors_clone,
                                concurrent_fragments_clone,
                                output_path_clone,
                                format_clone,
                            )
                            .await;

                            let status = match result {
                                Ok(path) => {
                                    if path.contains("Déjà téléchargé") {
                                        "already_downloaded"
                                    } else if path == "server issue" {
                                        "server_error"
                                    } else if path == "url not found or expired" {
                                        "not_found"
                                    } else if path == "cnx error" {
                                        "connection_error"
                                    } else {
                                        "success"
                                    }
                                }
                                Err(_) => "error",
                            };

                            let now_completed = completed_clone.fetch_add(1, Ordering::SeqCst) + 1;

                            let progress = serde_json::json!({
                                "download_id": download_id_thread,
                                "url": url,
                                "status": status,
                                "completed": now_completed,
                                "total": total_videos
                            });

                            let _ = handle_clone.emit("download-progress", progress);
                        });
                    });

                    thread_handles.push(thread_handle);
                }

                for thread_handle in thread_handles {
                    let _ = thread_handle.join();
                }

                if completed_atomic.load(Ordering::SeqCst) < total_videos {
                    thread::sleep(Duration::from_millis(500));
                }
            }

            let final_event = serde_json::json!({
                "download_id": download_id_clone,
                "status": "completed",
                "completed": completed_atomic.load(Ordering::SeqCst),
                "total": total_videos
            });

            let _ = handle_thread.emit("download-complete", final_event);
            println!(
                "[{}] Téléchargement terminé: {}/{}",
                download_id_clone,
                completed_atomic.load(Ordering::SeqCst),
                total_videos
            );
        });
    });

    Ok(download_id)
}
// -------------------------------------------------------------------------------------
// 2-1) Version ULTRA-LÉGÈRE (arrière-plan) mais il attend la fin en renvoie le résultat
// -------------------------------------------------------------------------------------

#[command]
pub async fn start_multi_download_background_await(
    handle: AppHandle,
    videos: Vec<VideoDownload>,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    max_concurrent: Option<usize>,
) -> Result<String, String> {
    if videos.is_empty() {
        return Err("Aucune vidéo à télécharger".to_string());
    }

    let download_id = uuid::Uuid::new_v4().to_string();
    let download_id_clone = download_id.clone();
    let max_concurrent = max_concurrent.unwrap_or(3);

    let completed_atomic = Arc::new(AtomicUsize::new(0));

    // Vecteur sécurisé pour stocker uniquement les noms de fichiers
    let downloaded_files = Arc::new(Mutex::new(Vec::<String>::new()));

    // Channel pour attendre la fin des téléchargements
    let (tx, rx) = tokio::sync::oneshot::channel::<Vec<String>>();

    let handle_thread = handle.clone();
    let downloaded_files_clone = downloaded_files.clone();
    thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("Failed to create tokio runtime");

        rt.block_on(async move {
            let total_videos = videos.len();

            for chunk in videos.chunks(max_concurrent) {
                let mut thread_handles = Vec::new();

                for video in chunk {
                    let handle_clone = handle_thread.clone();
                    let url = video.url.clone();
                    let video_name = video.video_name.clone();
                    let no_part_clone = no_part;
                    let ignore_errors_clone = ignore_errors;
                    let concurrent_fragments_clone = concurrent_fragments.clone();
                    let output_path_clone = output_path.clone();
                    let format_clone = video.format.clone();
                    let download_id_thread = download_id_clone.clone();
                    let completed_clone = completed_atomic.clone();
                    let downloaded_files_thread = downloaded_files_clone.clone();

                    let thread_handle = thread::spawn(move || {
                        let rt = tokio::runtime::Builder::new_current_thread()
                            .enable_all()
                            .build()
                            .expect("Failed to create tokio runtime");

                        rt.block_on(async move {
                            let result = one_vd_dwl(
                                handle_clone.clone(),
                                url.clone(),
                                video_name.clone(),
                                no_part_clone,
                                ignore_errors_clone,
                                concurrent_fragments_clone,
                                output_path_clone,
                                format_clone,
                            )
                            .await;

                            if let Ok(path) = result {
                                // Extraire uniquement le nom du fichier (sans chemin)
                                let file_name = path
                                    .split(std::path::MAIN_SEPARATOR)
                                    .last()
                                    .unwrap_or(&path)
                                    .to_string();

                                let mut files = downloaded_files_thread.lock().unwrap();
                                files.push(file_name);
                            }

                            completed_clone.fetch_add(1, Ordering::SeqCst);

                            let progress = serde_json::json!({
                                "download_id": download_id_thread,
                                "url": url,
                                "completed": completed_clone.load(Ordering::SeqCst),
                                "total": total_videos
                            });

                            let _ = handle_clone.emit("download-progress", progress);
                        });
                    });

                    thread_handles.push(thread_handle);
                }

                for thread_handle in thread_handles {
                    let _ = thread_handle.join();
                }

                if completed_atomic.load(Ordering::SeqCst) < total_videos {
                    thread::sleep(Duration::from_millis(500));
                }
            }

            let final_event = serde_json::json!({
                "download_id": download_id_clone,
                "status": "completed",
                "completed": completed_atomic.load(Ordering::SeqCst),
                "total": total_videos
            });

            let _ = handle_thread.emit("download-complete", final_event);

            // Envoyer la liste finale des noms de fichiers
            let _ = tx.send(downloaded_files_clone.lock().unwrap().clone());
        });
    });

    // Attendre que tous les téléchargements soient finis et récupérer les noms
    let files = rx.await.map_err(|_| "Erreur lors de la récupération des fichiers".to_string())?;

    // Retourner uniquement les noms
    Ok(format!("{}", files.join(", ")))
}



// -------------------------------------------------
// 3) Version SIMPLE (futures, sans threads système)
// -------------------------------------------------
#[command]
pub async fn multi_vd_dwl_futures(
    handle: AppHandle,
    videos: Vec<VideoDownload>,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    format: Option<String>,
    max_concurrent: Option<usize>,
) -> Result<Vec<DownloadResult>, String> {
    if videos.is_empty() {
        return Err("Aucune vidéo à télécharger".to_string());
    }

    let max_concurrent = max_concurrent.unwrap_or(3);
    let mut results = Vec::new();

    // Traitement par chunks (série) sans spawn pour limiter l'overhead
    for chunk in videos.chunks(max_concurrent) {
        let mut futures = Vec::new();
        for video in chunk {
            futures.push((
                video.url.clone(),
                one_vd_dwl(
                    handle.clone(),
                    video.url.clone(),
                    video.video_name.clone(),
                    no_part,
                    ignore_errors,
                    concurrent_fragments.clone(),
                    output_path.clone(),
                    format.clone(), // <--- important: on passe l'argument de la fonction, pas `video.format`
                ),
            ));
        }

        for (url, fut) in futures {
            let result = fut.await;
            let download_result = match result {
                Ok(path) => {
                    let status = if path.contains("Déjà téléchargé") {
                        "already_downloaded"
                    } else if path == "server issue" {
                        "server_error"
                    } else if path == "url not found or expired" {
                        "not_found"
                    } else if path == "cnx error" {
                        "connection_error"
                    } else {
                        "success"
                    };

                    DownloadResult {
                        url,
                        status: status.to_string(),
                        path: if status == "success" || status == "already_downloaded" {
                            Some(path)
                        } else {
                            None
                        },
                        error: None,
                    }
                }
                Err(error) => DownloadResult {
                    url,
                    status: "error".to_string(),
                    path: None,
                    error: Some(error),
                },
            };

            results.push(download_result);
        }
    }

    Ok(results)
}

// -------------------------------
// 4) Téléchargement d'une vidéo avec yt-dlp
// -------------------------------
#[command]
pub async fn one_vd_dwl(
    handle: AppHandle,
    url: String,
    video_name: String,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    format: Option<String>,
) -> Result<String, String> {
    let no_part = no_part.unwrap_or(true);
    let ignore_errors = ignore_errors.unwrap_or(true);
    let concurrent_fragments = concurrent_fragments.unwrap_or("4".to_string());

    // ---------- Choix du format ----------
    let extract_audio = format
        .as_ref()
        .map(|f| f.eq_ignore_ascii_case("mp3"))
        .unwrap_or(false);

    // ---------- Construction du nom de fichier ----------
    let filename = if video_name.trim().is_empty() {
        "%(title,id,upload_date).80s.%(ext)s".to_string()
    } else {
        let mut name = video_name.clone();
        if name.len() > 100 {
            name.truncate(100);
        }
        if extract_audio {
            if !name.to_lowercase().ends_with(".mp3") {
                name.push_str(".mp3");
            }
        } else if !name.to_lowercase().ends_with(".mp4") {
            name.push_str(".mp4");
        }
        name
    };

    // ---------- Dossier cible ----------
    let folder_path = match output_path {
        Some(p) => p,
        None => default_output_dir()?,
    };
    let output_option = format!("{}/{}", folder_path.replace('\\', "/"), filename);

    // ---------- Résolution des binaires ----------
    let yt_dlp_path = resolve_resource_bin(&handle, YT_DLP_BIN)?;
    if !yt_dlp_path.exists() {
        return Err(format!("{} introuvable à {:?}", YT_DLP_BIN, yt_dlp_path));
    }
    let ffmpeg_path = resolve_resource_bin(&handle, FFMPEG_BIN)?;
    if !ffmpeg_path.exists() {
        return Err(format!("{} introuvable à {:?}", FFMPEG_BIN, ffmpeg_path));
    }

    // ---------- Arguments yt-dlp ----------
    let mut args: Vec<String> = Vec::new();
    args.push(url.clone());

    // Arguments de base optimisés
    args.push("--no-warnings".to_string());
    args.push("--no-playlist".to_string());
    args.push("--no-progress".to_string());
    args.push("--no-overwrites".to_string());
    args.push("--verbose".to_string());
    args.push("--restrict-filenames".to_string());
    args.push("--no-mtime".to_string()); // Évite les problèmes de timestamp
    args.push("--embed-metadata".to_string()); // Métadonnées dans le fichier
    args.push("--socket-timeout".to_string());
    args.push("30".to_string());
    args.push("--retries".to_string());
    args.push("3".to_string());
    args.push("--fragment-retries".to_string());
    args.push("3".to_string());

    // User agent et headers
    args.push("--user-agent".to_string());
    args.push("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36".to_string());
    args.push("--add-header".to_string());
    args.push("Accept-Language: en-US,en;q=0.9,fr;q=0.8".to_string());
    args.push("--geo-bypass".to_string());

    if extract_audio {
        args.push("-f".to_string());
        args.push("bestaudio/best".to_string()); // Plus robuste
        args.push("--extract-audio".to_string());
        args.push("--audio-format".to_string());
        args.push("mp3".to_string());
        args.push("--audio-quality".to_string());
        args.push("0".to_string());

        // >>> miniature intégrée <<<
        args.push("--embed-thumbnail".to_string());
        args.push("--convert-thumbnails".to_string());
        args.push("jpg".to_string());

    } else {
        args.push("-f".to_string());
        args.push("bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best".to_string());
        args.push("--merge-output-format".to_string());
        args.push("mp4".to_string());
    
    }

 // Force l'utilisation du binaire ffmpeg packagé
    args.push("--ffmpeg-location".to_string());
    args.push(
        ffmpeg_path
            .parent()
            .unwrap_or_else(|| std::path::Path::new("."))
            .to_string_lossy()
            .to_string(),
    );
    args.push("--fixup".to_string());
    args.push("warn".to_string());

    // Sortie avec template pour parsing plus fiable
    args.push("-o".to_string());
    args.push(output_option.clone());

    if no_part {
        args.push("--no-part".to_string());
    }
    if ignore_errors {
        args.push("--ignore-errors".to_string());
    }
    args.push("--concurrent-fragments".to_string());
    args.push(concurrent_fragments);

    // ---------- Lancement du process ----------
    #[cfg(target_os = "windows")]
    let output = Command::new(&yt_dlp_path)
        .args(&args)
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .output()
        .map_err(|e| e.to_string())?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new(&yt_dlp_path)
        .args(&args)
        .output()
        .map_err(|e| e.to_string())?;

    let stdout_text = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr_text = String::from_utf8_lossy(&output.stderr).to_string();

    // ---------- Traitement des sorties ----------
    if stdout_text.contains("has already been downloaded") {
        if let Some(line) = stdout_text
            .lines()
            .find(|l| l.contains("has already been downloaded"))
        {
            let path = line.replace(" has already been downloaded", "");
            return Ok(format!("Fichier Déjà téléchargé : {}", path));
        }
    }

    let server_error = stderr_text.contains("HTTP Error 502")
        || stderr_text.contains("HTTP Error 503")
        || stderr_text.contains("Got error");
    let not_found_error = stderr_text.contains("HTTP Error 404")
        || stderr_text.contains("Not Found");
    let cnx_error = stderr_text.contains("getaddrinfo failed")
        || stderr_text.contains("Failed to resolve")
        || stderr_text.contains("Network");

    if server_error {
        return Ok("server issue".to_string());
    } else if not_found_error {
        return Ok("url not found or expired".to_string());
    } else if cnx_error {
        return Ok("cnx error".to_string());
    }

    if output.status.success() {
        let final_path = stdout_text
            .lines()
            .find(|l| l.contains("[Merger] Merging formats into"))
            .and_then(|l| l.split('"').nth(1))
            .or_else(|| {
                stdout_text
                    .lines()
                    .rev()
                    .find(|l| l.contains("[download] Destination:"))
                    .and_then(|l| l.split_once("Destination: ").map(|(_, p)| p.trim()))
            })
            .or_else(|| {
                stdout_text
                    .lines()
                    .find(|l| l.contains("[ExtractAudio] Destination:"))
                    .and_then(|l| l.split_once("Destination: ").map(|(_, p)| p.trim()))
            })
            .unwrap_or(&output_option);

        Ok(final_path.to_string())
    } else {
        Err(stderr_text)
    }
}
