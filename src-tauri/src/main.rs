// src/main.rs (Final Corrected Version)

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
mod commands;

use crate::core::database as db;
use commands::key_commands;
use tauri::Manager; // <-- 添加这一行

fn main() {
    tauri::Builder::default()
        .manage(db::DbConnection(std::sync::Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();
            let db_conn_state: tauri::State<db::DbConnection> = handle.state();
            let db_path = db::get_db_path(&handle)?;
            let conn = db::init(&db_path)?;
            *db_conn_state.0.lock().unwrap() = Some(conn);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            key_commands::add_key,
            key_commands::get_all_keys,
            key_commands::update_key,
            key_commands::delete_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}