use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ApiKey {
    pub id: String,
    pub name: String,
    pub vendor: String,
    pub value: String,
    pub masked_value: String,
    pub base_url: Option<String>,
    pub doc_url: Option<String>,
    pub code_snippets: Option<String>, // JSON string
    pub tags: Option<String>,          // JSON string
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}
