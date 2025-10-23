// src/core/database.rs (Final Corrected Version)

use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use rusqlite::{Connection, params};
use tauri::{AppHandle, Manager};
use uuid::Uuid;
use chrono::Utc;
use crate::core::error::CoreError;
use crate::core::models::ApiKey;

pub type Result<T> = std::result::Result<T, CoreError>;

#[derive(Debug)]
pub struct DbConnection(pub Mutex<Option<Connection>>);

pub fn get_db_path(app_handle: &AppHandle) -> Result<PathBuf> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        // 将原始错误(tauri::Error)映射为我们自己的错误类型
        .map_err(|e| CoreError::IoError(format!("Failed to resolve app data directory: {}", e)))?;

    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| CoreError::IoError(format!("Failed to create app data directory: {}", e)))?;
    }

    Ok(app_dir.join("keycraft.db"))
}

pub fn init(db_path: &PathBuf) -> Result<Connection> {
    let conn = Connection::open(db_path)
        .map_err(|e| CoreError::DatabaseError(e.to_string()))?;

    conn.execute_batch(
        "
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;

        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            vendor TEXT NOT NULL,
            value TEXT NOT NULL,
            masked_value TEXT NOT NULL,
            base_url TEXT,
            doc_url TEXT,
            code_snippets TEXT,
            tags TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        ",
    )
    .map_err(|e| CoreError::DatabaseError(e.to_string()))?;

    Ok(conn)
}

fn generate_masked_value(value: &str) -> String {
    if value.len() > 7 {
        format!("{}...{}", &value[..3], &value[value.len() - 4..])
    } else {
        "***".to_string()
    }
}

pub fn add_key(conn_mutex: &DbConnection, mut key: ApiKey) -> Result<ApiKey> {
    let conn = conn_mutex.0.lock().unwrap();
    let conn = conn.as_ref().ok_or(CoreError::DatabaseNotInitialized)?;

    key.id = Uuid::new_v4().to_string();
    key.masked_value = generate_masked_value(&key.value);
    let now = Utc::now().to_rfc3339();
    key.created_at = now.clone();
    key.updated_at = now;

    let tags_json = serde_json::to_string(&key.tags).map_err(|e| CoreError::SerializationError(e.to_string()))?;
    let snippets_json = serde_json::to_string(&key.code_snippets).map_err(|e| CoreError::SerializationError(e.to_string()))?;

    conn.execute(
        "INSERT INTO api_keys (id, name, vendor, value, masked_value, base_url, doc_url, code_snippets, tags, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            key.id, key.name, key.vendor, key.value, key.masked_value,
            key.base_url, key.doc_url, snippets_json, tags_json, key.notes,
            key.created_at, key.updated_at
        ],
    ).map_err(|e| CoreError::DatabaseError(e.to_string()))?;
    Ok(key)
}

pub fn get_all_keys(conn_mutex: &DbConnection) -> Result<Vec<ApiKey>> {
    let conn = conn_mutex.0.lock().unwrap();
    let conn = conn.as_ref().ok_or(CoreError::DatabaseNotInitialized)?;

    let mut stmt = conn.prepare("SELECT * FROM api_keys ORDER BY created_at DESC")
        .map_err(|e| CoreError::DatabaseError(e.to_string()))?;

    let key_iter = stmt.query_map([], |row| {
        let tags_json: String = row.get(8)?;
        let snippets_json: String = row.get(7)?;

        Ok(ApiKey {
            id: row.get(0)?,
            name: row.get(1)?,
            vendor: row.get(2)?,
            value: row.get(3)?,
            masked_value: row.get(4)?,
            base_url: row.get(5)?,
            doc_url: row.get(6)?,
            code_snippets: serde_json::from_str(&snippets_json).unwrap_or_default(),
            tags: serde_json::from_str(&tags_json).unwrap_or_default(),
            notes: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    }).map_err(|e| CoreError::DatabaseError(e.to_string()))?;

    let mut keys = Vec::new();
    for key in key_iter {
        keys.push(key.map_err(|e| CoreError::DatabaseError(e.to_string()))?);
    }
    Ok(keys)
}

pub fn update_key(conn_mutex: &DbConnection, key: ApiKey) -> Result<ApiKey> {
    let conn = conn_mutex.0.lock().unwrap();
    let conn = conn.as_ref().ok_or(CoreError::DatabaseNotInitialized)?;

    let masked_value = generate_masked_value(&key.value);
    let updated_at = Utc::now().to_rfc3339();
    let tags_json = serde_json::to_string(&key.tags).map_err(|e| CoreError::SerializationError(e.to_string()))?;
    let snippets_json = serde_json::to_string(&key.code_snippets).map_err(|e| CoreError::SerializationError(e.to_string()))?;

    conn.execute(
        "UPDATE api_keys SET name = ?1, vendor = ?2, value = ?3, masked_value = ?4, base_url = ?5, doc_url = ?6, code_snippets = ?7, tags = ?8, notes = ?9, updated_at = ?10 WHERE id = ?11",
        params![
            key.name, key.vendor, key.value, masked_value,
            key.base_url, key.doc_url, snippets_json, tags_json,
            key.notes, updated_at, key.id
        ],
    ).map_err(|e| CoreError::DatabaseError(e.to_string()))?;

    Ok(ApiKey { masked_value, updated_at, ..key })
}

pub fn delete_key_by_id(conn_mutex: &DbConnection, id: String) -> Result<()> {
    let conn = conn_mutex.0.lock().unwrap();
    let conn = conn.as_ref().ok_or(CoreError::DatabaseNotInitialized)?;

    conn.execute("DELETE FROM api_keys WHERE id = ?1", params![id])
        .map_err(|e| CoreError::DatabaseError(e.to_string()))?;

    Ok(())
}