// TypeScript type definition that matches the Rust ApiKey struct
export interface ApiKey {
  id: string;
  name: string;
  vendor: string;
  value: string;
  masked_value: string;
  base_url: string | null;
  doc_url: string | null;
  code_snippets: string | null; // JSON string
  tags: string | null;          // JSON string
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Type for creating a new API key (without auto-generated fields)
export interface CreateApiKeyRequest {
  name: string;
  vendor: string;
  value: string;
  base_url?: string | null;
  doc_url?: string | null;
  code_snippets?: string | null;
  tags?: string | null;
  notes?: string | null;
}

// Type for updating an existing API key
export interface UpdateApiKeyRequest extends CreateApiKeyRequest {
  id: string;
}