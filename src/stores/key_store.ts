import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { ApiKey, CreateApiKeyRequest } from '../types/apiKey';

interface KeyStore {
  // State
  keys: ApiKey[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchKeys: () => Promise<void>;
  addKey: (newKey: CreateApiKeyRequest) => Promise<void>;
  updateKey: (key: ApiKey) => Promise<void>;
  deleteKey: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useKeyStore = create<KeyStore>((set, get) => ({
  // Initial state
  keys: [],
  isLoading: false,
  error: null,

  // Fetch all keys from backend
  fetchKeys: async () => {
    set({ isLoading: true, error: null });
    try {
      const keys = await invoke<ApiKey[]>('get_all_keys');
      set({ keys, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch keys',
        isLoading: false 
      });
    }
  },

  // Add a new key
  addKey: async (newKey: CreateApiKeyRequest) => {
    set({ isLoading: true, error: null });
    try {
      await invoke<ApiKey>('add_key', { key: newKey });
      // Refresh the keys list after successful addition
      await get().fetchKeys();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add key',
        isLoading: false 
      });
      throw error; // Re-throw to allow UI to handle the error
    }
  },

  // Update an existing key
  updateKey: async (key: ApiKey) => {
    set({ isLoading: true, error: null });
    try {
      await invoke<ApiKey>('update_key', { key });
      // Refresh the keys list after successful update
      await get().fetchKeys();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update key',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a key by ID
  deleteKey: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_key', { id });
      // Refresh the keys list after successful deletion
      await get().fetchKeys();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete key',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));