// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  TOGETHERSYSTEMS PORTAL - TAURI MAIN                                      ║
// ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT                ║
// ║                                                                           ║
// ║  © 2025 Raymond Demitrio Tel                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, Window};

// ═══════════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Gibt Build-Metadaten zurück für Footer-Anzeige
#[tauri::command]
fn get_build_info() -> serde_json::Value {
    serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "name": env!("CARGO_PKG_NAME"),
        "branding": "[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS",
        "build_date": option_env!("BUILD_DATE").unwrap_or("unknown"),
        "commit": option_env!("GIT_COMMIT").unwrap_or("unknown")
    })
}

/// Zeigt Splash-Screen beim Start
#[tauri::command]
async fn close_splash(window: Window) {
    // Schließe Splashscreen falls vorhanden
    if let Some(splash) = window.get_window("splash") {
        splash.close().unwrap();
    }
    // Zeige Hauptfenster
    window.get_window("main").unwrap().show().unwrap();
}

/// System-Health-Check
#[tauri::command]
fn health_check() -> serde_json::Value {
    serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH
    })
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_build_info,
            close_splash,
            health_check
        ])
        .setup(|app| {
            // Logging
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            
            // Version in Console
            println!("╔═══════════════════════════════════════════════════════════════╗");
            println!("║  TogetherSystems Portal v{}                            ║", env!("CARGO_PKG_VERSION"));
            println!("║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                       ║");
            println!("╚═══════════════════════════════════════════════════════════════╝");
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten der Anwendung");
}

