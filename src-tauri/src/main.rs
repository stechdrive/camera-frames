fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running CAMERA_FRAMES desktop app");
}
