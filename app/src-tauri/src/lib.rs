mod download;
mod github_releases;
mod util;

use download::download;
use futures_util::{pin_mut, StreamExt};
use tauri::{AppHandle, Emitter};
use tokio::process::Command;
use util::ModpackConfig;
use uuid::Uuid;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn read_config() -> Result<ModpackConfig, String> {
    util::read_metadata()
}

#[tauri::command]
fn get_prism_launcher_path() -> Result<Option<String>, String> {
    util::get_prism_launcher_path()
}

#[tauri::command]
async fn install_portable(app: AppHandle, path: &str) -> Result<(), String> {
    // Validate path
    let path = std::path::Path::new(path);
    if !path.exists() {
        return Err("The specified path doesn't exist".into());
    }

    if !path.is_dir() {
        return Err("The specified path is not a directory".into());
    }

    // Emit progress update
    app.emit(
        "install_progress",
        (0.0, "Starting portable installation..."),
    )
    .unwrap();

    // Installing PrismLauncher
    let zip_path = path.join("launcher.zip");
    let s = download(
        "PrismLauncher/PrismLauncher",
        |s| s.to_lowercase().contains("portable") && s.contains("MSVC") && !s.contains("arm64"),
        zip_path.as_path(),
        None,
    )
    .await;

    if let Err(e) = s {
        return Err(format!("Failed to download PrismLauncher: {}", e));
    }

    let stream = s.unwrap();

    pin_mut!(stream);
    while let Some(status) = stream.next().await {
        match status {
            download::DownloadStatus::Error(error) => {
                return Err(format!("Error downloading PrismLauncher: {}", error));
            }
            download::DownloadStatus::Progress(percentage, msg) => {
                // Update the UI with the progress
                app.emit("install_progress", (percentage / 2.0, msg))
                    .unwrap();
            }
        }
    }

    app.emit("install_progress", (0.5, "Extracting PrismLauncher"))
        .unwrap();

    app.emit("click_install", ()).unwrap();

    

    Ok(())
}

#[tauri::command]
async fn install_launcher(app: AppHandle, custom_path: Option<String>) -> Result<(), String> {
    let path = custom_path.or(util::get_prism_launcher_path().ok().flatten());

    log::info!("PrismLauncher path: {:?}", path);
    if path.is_none() {
        // Installing PrismLauncher
        let tmp_path = std::env::temp_dir().join(Uuid::new_v4().to_string() + "-installer.exe");

        let s = download(
            "PrismLauncher/PrismLauncher",
            |s| s.contains(".exe") && s.contains("MSVC") && !s.contains("arm64"),
            tmp_path.as_path(),
            None,
        )
        .await;

        if let Err(e) = s {
            return Err(format!("Failed to download PrismLauncher: {}", e));
        }

        let stream = s.unwrap();

        pin_mut!(stream);
        while let Some(status) = stream.next().await {
            match status {
                download::DownloadStatus::Error(error) => {
                    return Err(format!("Error downloading PrismLauncher: {}", error));
                }
                download::DownloadStatus::Progress(percentage, msg) => {
                    // Update the UI with the progress
                    app.emit("install_progress", (percentage / 2.0, msg))
                        .unwrap();
                }
            }
        }

        app.emit("install_progress", (0.5, "Installing PrismLauncher"))
            .unwrap();

        app.emit("click_install", ()).unwrap();

        let out = Command::new(&tmp_path)
            .output()
            .await
            .map_err(|e| format!("Failed to run PrismLauncher installer: {}", e))?;

        let status = out.status;
        if !status.success() {
            return Err(format!(
                "PrismLauncher installer exited with code: {}",
                status.code().unwrap_or(-1)
            ));
        }
    }

    let path = path.or(util::get_prism_launcher_path().ok().flatten());
    if path.is_none() {
        return Err("PrismLauncher installation canceled.".into());
    }

    let path = path.unwrap();

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    },
                ))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_config,
            get_prism_launcher_path,
            install_launcher,
            install_portable
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
