use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, AppHandle, path::BaseDirectory,Manager};
use tokio::process::Command;
use tokio::fs;
use std::process::Stdio;
use uuid::Uuid;
use chrono::Local;
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoInfo {
    pub id: String,
    pub title: String,
    pub author: String,
    pub duration: String,
    pub size: String,
    pub quality: String,
    pub format: String,
    pub url: String,
    pub thumbnail: String,
}

#[tauri::command]
pub async fn get_video_info(
    url: String,
    format: String,
    outputname: String,
    app: AppHandle,
) -> Result<VideoInfo, String> {
    // --- résolution de yt-dlp ---
    let yt_dlp_path = app
        .path()
        .resolve("resources\\yt-dlp.exe", BaseDirectory::Resource)
        .map_err(|e| format!("Erreur résolution yt-dlp : {}", e))?;

    if !yt_dlp_path.exists() {
        return Err(format!("yt-dlp.exe introuvable à {:?}", &yt_dlp_path));
    }

    // --- choix du format ---
    let yt_format = match format.to_lowercase().as_str() {
        "mp3" => "bestaudio[ext=m4a]/bestaudio",
        "mp4" => "bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
        _ => return Err("Format non supporté. Choisir 'mp3' ou 'mp4'.".to_string()),
    };

    // --- exécution de yt-dlp ---
    let output = Command::new(&yt_dlp_path)
        .args([
            "--format", yt_format,               // Utilisez --format au lieu de -f
            "--skip-download",
            "--dump-json",
            "--no-playlist",
            "-U",                       // Évite la mise à jour automatique
            "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.188 Safari/537.36",
            "--add-header", "Accept-Language: en-US,en;q=0.9",
            "--geo-bypass",
            "--no-warnings",
            "--ignore-errors",
            "--socket-timeout", "30",
            &url
        ])
        .creation_flags(0x08000000) // pour ne pas afficher de console
        .stdout(Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("Erreur lors de l'exécution de yt-dlp: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "yt-dlp a échoué : {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|e| format!("Erreur conversion stdout en UTF-8: {}", e))?;

    let json: serde_json::Value =
        serde_json::from_str(&stdout).map_err(|e| format!("Erreur parsing JSON: {}", e))?;

    fn get_number(json: &serde_json::Value, key: &str) -> Option<f64> {
        json.get(key)
            .and_then(|v| v.as_f64().or_else(|| v.as_str()?.parse::<f64>().ok()))
    }

    // --- création de la struct VideoInfo ---
    let info = VideoInfo {
        id: Uuid::new_v4().to_string(),
        title: if !outputname.is_empty() {
            outputname.clone()
        } else {
            json.get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        },
        author: json.get("uploader").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        duration: json.get("duration_string").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        quality:  if format.to_lowercase() == "mp3" {
            // 🎵 afficher la meilleure qualité audio détectée
            if let Some(abr) = get_number(&json, "abr") {
                format!("{} kbps", abr as u32)
            } else {
                "128 kbps".to_string() // valeur par défaut si yt-dlp ne fournit rien
            }
        } else {
             // 🎥 pour mp4 → extraire la hauteur vidéo après "x"
            if let Some(format_str) = json.get("format").and_then(|v| v.as_str()) {
                // Regex pour capturer la partie après "x"
                let re = regex::Regex::new(r"x(\d+)").unwrap();
                if let Some(cap) = re.captures(format_str) {
                    format!("{}p", &cap[1]) // ex: "1080p"
                } else {
                    format_str.to_string() // fallback si pas trouvé
                }
            } else {
                "".to_string()
            }
        },
        format: format.clone(),
        size: {
            let (bytes, estimated) = if format.to_lowercase() == "mp3" {
                if let Some(b) = get_number(&json, "filesize")
                    .or_else(|| get_number(&json, "filesize_approx"))
                {
                    (b, false) // ✅ valeur réelle
                } else {
                    let duration = get_number(&json, "duration").unwrap_or(0.0);
                    let abr = get_number(&json, "abr").unwrap_or(128.0); // fallback 128 kbps
                    (duration * abr * 1000.0 / 8.0, true) // ⚡ estimation
                }
            } else {
                if let Some(b) = get_number(&json, "filesize")
                    .or_else(|| get_number(&json, "filesize_approx"))
                {
                    (b, false) // ✅ valeur réelle
                } else {
                    let duration = get_number(&json, "duration").unwrap_or(0.0);
                    let tbr = get_number(&json, "tbr").unwrap_or(1000.0); // fallback arbitraire
                    (duration * tbr * 1000.0 / 8.0, true) // ⚡ estimation
                }
            };

            if estimated {
                format!("~{:.2} MB", bytes / 1_048_576.0) // signe ~ devant
            } else {
                format!("{:.2} MB", bytes / 1_048_576.0)
            }
        },
        url: url.clone(),
        thumbnail: json.get("thumbnail").and_then(|v| v.as_str()).unwrap_or("").to_string(),
    };


    // --- chemin du dossier AppData ---
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir AppData: {}", e))?;

    // chemin complet du fichier temp_DWL.json
    let json_path = app_data.join("temp_DWL.json");

    // crée le dossier si nécessaire
    tokio::fs::create_dir_all(&app_data)
        .await
        .map_err(|e| format!("Impossible de créer le dossier AppData: {}", e))?;





    // --- lecture du fichier existant (async) ---
    let mut map: HashMap<String, VideoInfo> = if json_path.exists() {
        let data = fs::read_to_string(&json_path)
            .await
            .map_err(|e| format!("Erreur lecture temp_DWL.json : {}", e))?;
        serde_json::from_str(&data)
            .map_err(|e| format!("Erreur parsing temp_DWL.json : {}", e))?
    } else {
        HashMap::new()
    };

    // --- insertion de la nouvelle vidéo ---
    let next_key = format!("url {}", map.len() + 1);
    map.insert(next_key, info.clone());

    // --- création du dossier si nécessaire ---
    if let Some(parent) = json_path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Erreur création dossier AppData : {}", e))?;
    } else {
        return Err("Impossible de déterminer le dossier parent pour temp_DWL.json".into());
    }

    // --- écriture du fichier JSON (async) ---
    let json_string = serde_json::to_string_pretty(&map)
        .map_err(|e| format!("Erreur sérialisation JSON : {}", e))?;
    fs::write(&json_path, json_string)
        .await
        .map_err(|e| format!("Erreur écriture temp_DWL.json : {}", e))?;

    Ok(info)
}




// -------------------------------------------------------------------------------- 
// fonctionne pour supprimer tous le fichier temps de liste des video a telecharger  
// --------------------------------------------------------------------------------
#[command]
pub async fn delete_temp_dwl(app: AppHandle) -> String {
    let path = match app.path().app_data_dir() {
        Ok(dir) => dir.join("temp_DWL.json"),
        Err(e) => return format!("Impossible d’obtenir le dossier AppData : {}", e),
    };

    if !path.exists() {
        return "Le fichier temp_DWL.json n’existe pas.".to_string();
    }

    match fs::remove_file(&path).await {
        Ok(_) => "Fichier temp_DWL.json supprimé avec succès.".to_string(),
        Err(e) => format!("Erreur suppression temp_DWL.json : {}", e),
    }
}


// ------------------------------------------------------------------------------------- 
// fonctionne pour supprimer une carte du fichier temps de liste des video a telecharger  
// -------------------------------------------------------------------------------------
#[command]
pub async fn delete_video_by_id(app: AppHandle, id: String) -> Result<String, String> {
    // --- chemin du fichier ---
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d’obtenir AppData : {}", e))?
        .join("temp_DWL.json");

    if !path.exists() {
        return Err("Le fichier temp_DWL.json n’existe pas.".to_string());
    }

    // --- lecture du fichier ---
    let content = fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Erreur lecture : {}", e))?;

    let mut map: HashMap<String, VideoInfo> =
        serde_json::from_str(&content).map_err(|e| format!("Erreur parsing JSON : {}", e))?;

    // --- recherche de la clé correspondant à l'id ---
    let key_to_remove = map
        .iter()
        .find_map(|(key, video)| if video.id == id { Some(key.clone()) } else { None });

    let key = match key_to_remove {
        Some(k) => k,
        None => return Err(format!("Aucune vidéo trouvée avec l'id '{}'", id)),
    };

    // --- suppression ---
    map.remove(&key);

    // --- réécriture du fichier ---
    let new_content =
        serde_json::to_string_pretty(&map).map_err(|e| format!("Erreur sérialisation : {}", e))?;

    fs::write(&path, new_content)
        .await
        .map_err(|e| format!("Erreur écriture : {}", e))?;

    Ok(format!("Vidéo with id '{}' deleted with success.", id))
}


// ----------------------------------------------------------------------------------------- 
// fonctionne pour cree un fichier searce_history.json pour l'historique des telechargements  
// -----------------------------------------------------------------------------------------

#[command]
pub async fn copy_temp_to_history(app: AppHandle) -> Result<String, String> {

    // --- chemin du dossier AppData ---
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir AppData: {}", e))?;

    // fichiers JSON
    let temp_path = app_data.join("temp_DWL.json");
    let history_path = app_data.join("search_history.json");

    // --- créer le dossier si nécessaire ---
    fs::create_dir_all(&app_data)
        .await
        .map_err(|e| format!("Impossible de créer le dossier AppData: {}", e))?;

    // --- date du jour ---
    let today = Local::now().format("%Y-%m-%d").to_string();

    // --- lecture de temp_DWL.json ---
    if !temp_path.exists() {
        return Err("Le fichier temp_DWL.json est introuvable.".to_string());
    }
    let temp_content = fs::read_to_string(&temp_path)
        .await
        .map_err(|e| format!("Erreur lecture temp_DWL.json : {}", e))?;

    let temp_data: HashMap<String, Value> = serde_json::from_str(&temp_content)
        .map_err(|e| format!("Erreur parsing temp_DWL.json : {}", e))?;

    // --- lecture de search_history.json si existe ---
    let mut history: HashMap<String, HashMap<String, Value>> = if history_path.exists() {
        let content = fs::read_to_string(&history_path)
            .await
            .map_err(|e| format!("Erreur lecture search_history.json : {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Erreur parsing search_history.json : {}", e))?
    } else {
        HashMap::new()
    };

    // --- fusion : ajoute au jour courant sans écraser l’historique ---
    history
        .entry(today)
        .or_insert_with(HashMap::new)
        .extend(temp_data);

    // --- écriture dans search_history.json ---
    let new_content = serde_json::to_string_pretty(&history)
        .map_err(|e| format!("Erreur sérialisation JSON : {}", e))?;
    fs::write(&history_path, new_content)
        .await
        .map_err(|e| format!("Erreur écriture search_history.json : {}", e))?;

    Ok("Les données de temp_DWL.json ont été ajoutées à search_history.json.".to_string())
}

// -------------------------------------------------------------------------------------------------
// fonctionne pour cree un fichier single_download.json pour l'historique des telechargements single
// -------------------------------------------------------------------------------------------------

#[command]
pub async fn add_to_single_download_by_date(
    app: AppHandle,
    url: String,
    title: String,
    format: String,
) -> Result<String, String> {
    // --- chemin du dossier AppData ---
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir AppData: {}", e))?;

    let single_path = app_data.join("single_download.json");

    // --- créer le dossier si nécessaire ---
    fs::create_dir_all(&app_data)
        .await
        .map_err(|e| format!("Impossible de créer le dossier AppData: {}", e))?;

    // --- lecture de single_download.json si existe ---
    let mut single_data: HashMap<String, HashMap<String, Value>> = if single_path.exists() {
        let content = fs::read_to_string(&single_path)
            .await
            .map_err(|e| format!("Erreur lecture single_download.json : {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Erreur parsing single_download.json : {}", e))?
    } else {
        HashMap::new()
    };

    // --- date du jour ---
    let today = Local::now().format("%Y-%m-%d").to_string();

    // --- création de l’entrée ---
    let entry = serde_json::json!({
        "url": url,
        "title": title,
        "format": format
    });

    // --- ajout à la date du jour ---
    let date_entry = single_data.entry(today).or_insert_with(HashMap::new);
    let next_key = format!("url {}", date_entry.len() + 1);
    date_entry.insert(next_key, entry);

    // --- écriture dans single_download.json ---
    let new_content = serde_json::to_string_pretty(&single_data)
        .map_err(|e| format!("Erreur sérialisation JSON : {}", e))?;
    fs::write(&single_path, new_content)
        .await
        .map_err(|e| format!("Erreur écriture single_download.json : {}", e))?;

    Ok("Vidéo ajoutée à single_download.json sous la date du téléchargement.".to_string())
}
