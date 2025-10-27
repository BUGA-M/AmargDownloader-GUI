// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use open;
//use std::os::windows::process::CommandExt;
use std::path::PathBuf;
//use std::process::Command;
//use tauri::path::BaseDirectory;
use tauri::{
    command,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager, WindowEvent,
};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_log::{Target, TargetKind};

use tokio::time::{sleep, Duration};
use webbrowser;

mod downloads;
mod info_urls;

#[command]
async fn is_startup_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    let app = app.clone();
    tokio::task::spawn_blocking(move || {
        let autolaunch = app.autolaunch();
        autolaunch.is_enabled().map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[command]
async fn toggle_startup(app: AppHandle, enable: bool) -> Result<(), String> {
    let app = app.clone();
    tokio::task::spawn_blocking(move || {
        let autolaunch = app.autolaunch();
        if enable {
            autolaunch.enable().map_err(|e| e.to_string())?;
        } else {
            autolaunch.disable().map_err(|e| e.to_string())?;
        }
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// 1️⃣ Ouvre un dialogue pour sélectionner un dossier de sortie
#[command]
async fn select_output_folder(app: AppHandle) -> Result<Option<String>, String> {
    if let Some(folder) = app.dialog().file().blocking_pick_folder() {
        if let Ok(path_buf) = folder.into_path() {
            let path_string = path_buf.to_string_lossy().to_string();
            return Ok(Some(path_string));
        }
    }
    Ok(None)
}

/// 1️⃣ Récupère le chemin du dossier Downloads\AMARG
#[command]
fn get_amarg_folder_path() -> Result<String, String> {
    let downloads_dir = dirs::download_dir().ok_or("Impossible de trouver le dossier Downloads")?;

    let amarg_dir: PathBuf = downloads_dir.join("AMARG");

    if !amarg_dir.exists() {
        // Optionnel : créer le dossier s’il n’existe pas
        std::fs::create_dir_all(&amarg_dir)
            .map_err(|e| format!("Impossible de créer le dossier AMARG: {e}"))?;
    }

    Ok(amarg_dir.to_string_lossy().to_string())
}

/// 2️⃣ Ouvre un dossier donné dans l’explorateur
#[command]
async fn open_folder(path: String) -> Result<(), String> {
    let folder = PathBuf::from(path);

    if !folder.exists() {
        return Err(format!("Le dossier {:?} n'existe pas", folder));
    }

    open::that(folder).map_err(|e| format!("Erreur lors de l'ouverture du dossier: {e}"))?;

    Ok(())
}
// 2️⃣ Open link on a browser

#[command]
async fn open_link(url: String) -> Result<(), String> {
    webbrowser::open(&url).map_err(|e| format!("Failed to open browser: {}", e))?;
    Ok(())
}

/// 2️⃣ Telecharge une vidéo avec yt-dlp
#[command]
async fn one_vd_dwl_caller(
    handle: AppHandle,
    url: String,
    video_name: String,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    format: Option<String>, // <-- nouvel argument
) -> Result<String, String> {
    downloads::one_vd_dwl(
        handle,
        url,
        video_name,
        no_part,
        ignore_errors,
        concurrent_fragments,
        output_path,
        format,
    )
    .await
}
/// 3️⃣ Télécharge multi vidéo avec yt-dlp
#[command]
async fn multi_vd_dwl_caller(
    handle: AppHandle,
    videos: Vec<downloads::VideoDownload>,
    no_part: Option<bool>,
    ignore_errors: Option<bool>,
    concurrent_fragments: Option<String>,
    output_path: Option<String>,
    max_concurrent: Option<usize>,
) -> Result<String, String> {
    downloads::start_multi_download_background_await(
        handle,
        videos,
        no_part,
        ignore_errors,
        concurrent_fragments,
        output_path,
        max_concurrent,
    )
    .await
}

/// Point d’entrée de l’application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir {
                        file_name: Some("Downloads".to_string()),
                    }),
                ])
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // On ignore complètement les arguments
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.set_focus(); // ramène la fenêtre
                let _ = w.show(); // au cas où elle était cachée
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        // Commandes accessibles depuis le frontend
        .invoke_handler(tauri::generate_handler![
            one_vd_dwl_caller,
            multi_vd_dwl_caller,
            downloads::one_vd_dwl,
            downloads::start_multi_download_background_await,
            get_amarg_folder_path,
            open_folder,
            select_output_folder,
            toggle_startup,
            is_startup_enabled,
            info_urls::get_video_info,
            info_urls::delete_temp_dwl,
            info_urls::delete_video_by_id,
            info_urls::copy_temp_to_history,
            info_urls::add_to_single_download_by_date,
            open_link
        ])
        // Setup (config initiale)
        .setup(|app| {
            let splash = app.get_webview_window("splashscreen").unwrap();
            let main = app.get_webview_window("main").unwrap();

            // ✅ Détecter le mode au début
            let args: Vec<String> = std::env::args().collect();
            let is_startup_mode = args.contains(&"--minimized".to_string());

            // ✅ Menu et Tray (peu importe le mode)
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let open_i = MenuItem::with_id(app, "open", "Open AMARG Window", true, None::<&str>)?;
            let open_folder_i = MenuItem::with_id(
                app,
                "open_folder",
                "Open Downloads Folder",
                true,
                None::<&str>,
            )?;
            let menu = Menu::with_items(app, &[&open_i, &open_folder_i, &quit_i])?;

            let tray_icon = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("AMARG Downloader")
                .menu(&menu)
                .build(app.handle())?;

            // Gestion des events du tray
            tray_icon.on_menu_event(|app, event| match event.id.as_ref() {
                "open" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.unminimize();
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                "open_folder" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("open-downloads-folder", ());
                    }
                }
                _ => {}
            });

            // ✅ Logique conditionnelle unifiée
            if is_startup_mode {
                // MODE STARTUP : Tray seulement, pas de splashscreen
                let _ = splash.destroy(); // On n'a pas besoin du splash
                let _ = main.hide(); // Main reste cachée
            } else {
                // MODE NORMAL : Splashscreen puis main
                tauri::async_runtime::spawn({
                    let splash = splash.clone();
                    let main = main.clone();
                    async move {
                        // Splashscreen pendant 4s
                        sleep(Duration::from_secs(4)).await;

                        // Transition splash → main
                        let _ = splash.destroy();
                        let _ = main.show();
                        let _ = main.set_focus();
                    }
                });
            }

            Ok(())
        })
        // ✅ Empêcher la fermeture → cache la fenêtre
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        // Lancement
        .run(tauri::generate_context!())
        .expect("error while running tauri AMARG application");
}
