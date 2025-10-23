// src/commands/key_commands.rs (Corrected)

use tauri::State;
use crate::core::{database as db, models::ApiKey};
use crate::core::error::CoreError;

#[tauri::command]
pub fn add_key(state: State<db::DbConnection>, key: ApiKey) -> Result<ApiKey, CoreError> {
    db::add_key(&state, key)
}

#[tauri::command]
pub fn get_all_keys(state: State<db::DbConnection>) -> Result<Vec<ApiKey>, CoreError> {
    db::get_all_keys(&state)
}

#[tauri::command]
pub fn update_key(state: State<db::DbConnection>, key: ApiKey) -> Result<ApiKey, CoreError> {
    db::update_key(&state, key)
}

#[tauri::command]
pub fn delete_key(state: State<db::DbConnection>, id: String) -> Result<(), CoreError> {
    db::delete_key_by_id(&state, id)
}