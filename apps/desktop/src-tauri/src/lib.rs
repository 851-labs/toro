#[tauri::command]
fn host_url() -> String {
    std::env::var("TORO_HOST_URL").unwrap_or_else(|_| "http://127.0.0.1:17345".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![host_url])
        .run(tauri::generate_context!())
        .expect("error while running Toro desktop");
}
