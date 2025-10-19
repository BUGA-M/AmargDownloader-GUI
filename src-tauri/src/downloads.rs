use serde::{Deserialize, Serialize};
use serde_json; // for json! macro payloads
use std::process::{Command,Stdio};
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;
use std::time::Duration;
use tauri::{command, AppHandle, Emitter, Manager};

use std::io::{BufRead, BufReader};
use regex::Regex;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt; // for creation_flags

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoDownload {
    pub url: String,
    pub video_name: String,
    pub format: Option<String>,
}

#[derive(Clone, Serialize)]
struct ProgressPayload {
    url: String,
    progress: f64,
    speed: String,
    eta: String,
    downloaded_bytes: u64,
    total_bytes: u64,
    video_name: String,
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

// -------------------------------------------------------------------------------------
// 1) Version ULTRA-LÉGÈRE (arrière-plan) mais il attend la fin en renvoie le résultat
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
    let max_concurrent = max_concurrent.unwrap_or(4);

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

                                let payload = serde_json::json!({
                                    "id": download_id_thread, 
                                    "url": url,
                                    "video_name": video_name,
                                    "final_path": path,
                                    "status": "success"
                                });
                                let _ = handle_clone.emit("download-complete-single", payload);
                            }

                            completed_clone.fetch_add(1, Ordering::SeqCst);

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



// -------------------------------
// 2) Téléchargement d'une vidéo avec yt-dlp
// -------------------------------
// Ajoutez cette structure pour les événements de complétion
#[derive(Clone, Serialize)]
struct CompletionPayload {
    url: String,
    status: String, // "success", "error", "already_downloaded", etc.
    video_name: String,
    final_path: Option<String>,
    error_message: Option<String>,
}

// Modifiez la fonction one_vd_dwl pour émettre l'événement AVANT la fin
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
    args.push("--newline".to_string());
    args.push("--no-overwrites".to_string());
    args.push("--verbose".to_string());
    args.push("--restrict-filenames".to_string());
    args.push("--no-mtime".to_string());
    args.push("--embed-metadata".to_string());
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
        args.push("bestaudio/best".to_string());
        args.push("--extract-audio".to_string());
        args.push("--audio-format".to_string());
        args.push("mp3".to_string());
        args.push("--audio-quality".to_string());
        args.push("0".to_string());
        args.push("--embed-thumbnail".to_string());
        args.push("--convert-thumbnails".to_string());
        args.push("jpg".to_string());
    } else {
        args.push("-f".to_string());
        args.push("bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best".to_string());
        args.push("--merge-output-format".to_string());
        args.push("mp4".to_string());
    }

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
    let mut child = Command::new(&yt_dlp_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(not(target_os = "windows"))]
    let mut child = Command::new(&yt_dlp_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().ok_or("Impossible de capturer stdout")?;
    let stderr = child.stderr.take().ok_or("Impossible de capturer stderr")?;

    let progress_regex = Regex::new(
        r"\[download\]\s+(\d+\.?\d*)%\s+of\s+~?(\d+\.?\d*)(.*?)\s+at\s+(\d+\.?\d*)(.*?)/s\s+ETA\s+(\d{2}:\d{2})"
    ).unwrap();

    let mut stdout_output = String::new();
    let mut last_progress = 0.0;

    let stderr_handle = std::thread::spawn(move || {
        let mut stderr_lines = String::new();
        let stderr_reader = BufReader::new(stderr);
        for line in stderr_reader.lines().flatten() {
            stderr_lines.push_str(&line);
            stderr_lines.push('\n');
        }
        stderr_lines
    });

    // Lecture ligne par ligne de stdout
    let stdout_reader = BufReader::new(stdout);
    for line in stdout_reader.lines().flatten() {
        stdout_output.push_str(&line);
        stdout_output.push('\n');

        if let Some(caps) = progress_regex.captures(&line) {
            let progress = caps.get(1).and_then(|m| m.as_str().parse::<f64>().ok()).unwrap_or(0.0);
            last_progress = progress;
            
            let total_str = caps.get(2).and_then(|m| m.as_str().parse::<f64>().ok()).unwrap_or(0.0);
            let unit = caps.get(3).map(|m| m.as_str().trim()).unwrap_or("");
            let speed_val = caps.get(4).and_then(|m| m.as_str().parse::<f64>().ok()).unwrap_or(0.0);
            let speed_unit = caps.get(5).map(|m| m.as_str().trim()).unwrap_or("");
            let eta = caps.get(6).map(|m| m.as_str()).unwrap_or("00:00");

            let total_bytes = convert_to_bytes(total_str, unit);
            let downloaded_bytes = (total_bytes as f64 * progress / 100.0) as u64;
            let speed_str = format!("{:.2}{}", speed_val, speed_unit);

            emit_progress(
                &handle,
                url.clone(),
                progress,
                speed_str,
                eta.to_string(),
                downloaded_bytes,
                total_bytes,
                video_name.clone(),
            );
        }
    }

    let stderr_output = stderr_handle.join().unwrap_or_default();
    let status = child.wait().map_err(|e| e.to_string())?;

    // ---------- ÉMISSION DU STATUS FINAL AVANT DE RETOURNER ----------
    
    // Helper pour émettre le statut de complétion
    let emit_completion = |status: &str, path: Option<String>, error: Option<String>| {
        // Émettre 100% si pas encore fait
        if last_progress < 100.0 {
            emit_progress(
                &handle,
                url.clone(),
                100.0,
                "0KB".to_string(),
                "00:00".to_string(),
                0,
                0,
                video_name.clone(),
            );
        }
        
        let payload = CompletionPayload {
            url: url.clone(),
            status: status.to_string(),
            video_name: video_name.clone(),
            final_path: path.clone(),
            error_message: error,
        };
        let _ = handle.emit("download-complete-single", payload);
    };

    // Vérification "already downloaded"
    if stdout_output.contains("has already been downloaded") {
        if let Some(line) = stdout_output
            .lines()
            .find(|l| l.contains("has already been downloaded"))
        {
            let path = line.replace(" has already been downloaded", "");
            let full_message = format!("Fichier Déjà téléchargé : {}", path);
            
            emit_completion("already_downloaded", Some(path.clone()), None);
            return Ok(full_message);
        }
    }

    // Détection des erreurs serveur
    let server_error = stderr_output.contains("HTTP Error 502")
        || stderr_output.contains("HTTP Error 503")
        || stderr_output.contains("Got error");
    
    let not_found_error = stderr_output.contains("HTTP Error 404")
        || stderr_output.contains("Not Found");
    
    let cnx_error = stderr_output.contains("getaddrinfo failed")
        || stderr_output.contains("Failed to resolve")
        || stderr_output.contains("Network");

    if server_error {
        emit_completion("server_error", None, Some("Erreur serveur (502/503)".to_string()));
        return Ok("server issue".to_string());
    } else if not_found_error {
        emit_completion("not_found", None, Some("URL introuvable ou expirée".to_string()));
        return Ok("url not found or expired".to_string());
    } else if cnx_error {
        emit_completion("connection_error", None, Some("Erreur de connexion".to_string()));
        return Ok("cnx error".to_string());
    }

    // ---------- SUCCÈS ----------
    if status.success() {
        let final_path = stdout_output
            .lines()
            .find(|l| l.contains("[Merger] Merging formats into"))
            .and_then(|l| l.split('"').nth(1))
            .or_else(|| {
                stdout_output
                    .lines()
                    .rev()
                    .find(|l| l.contains("[download] Destination:"))
                    .and_then(|l| l.split_once("Destination: ").map(|(_, p)| p.trim()))
            })
            .or_else(|| {
                stdout_output
                    .lines()
                    .find(|l| l.contains("[ExtractAudio] Destination:"))
                    .and_then(|l| l.split_once("Destination: ").map(|(_, p)| p.trim()))
            })
            .unwrap_or(&output_option);

        emit_completion("success", Some(final_path.to_string()), None);
        Ok(final_path.to_string())
    } else {
        emit_completion("error", None, Some(stderr_output.clone()));
        Err(stderr_output)
    }
}

fn convert_to_bytes(value: f64, unit: &str) -> u64 {
    let multiplier = match unit.to_uppercase().as_str() {
        "KIB" => 1024.0,
        "MIB" => 1024.0 * 1024.0,
        "GIB" => 1024.0 * 1024.0 * 1024.0,
        "KB" => 1000.0,
        "MB" => 1000.0 * 1000.0,
        "GB" => 1000.0 * 1000.0 * 1000.0,
        _ => 1.0,
    };
    (value * multiplier) as u64
}

fn emit_progress(
    handle: &AppHandle, 
    url: String, 
    progress: f64, 
    speed: String, 
    eta: String, 
    downloaded_bytes: u64, 
    total_bytes: u64, 
    video_name: String
) {
    let payload = ProgressPayload {
        url,
        progress,
        speed,
        eta,
        downloaded_bytes,
        total_bytes,
        video_name,
    };
    let _ = handle.emit("download-progress", payload);
}