// src/core/error.rs (Corrected and Completed)

use serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("IO Error: {0}")]
    IoError(String),

    #[error("Database Error: {0}")]
    DatabaseError(String),
    
    #[error("Database is not initialized")]
    DatabaseNotInitialized,
    
    #[error("Serialization Error: {0}")]
    SerializationError(String),
}

// Implement Serialize for CoreError to allow it to be returned from Tauri commands
impl Serialize for CoreError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}