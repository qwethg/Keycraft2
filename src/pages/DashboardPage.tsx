import React, { useEffect, useState } from 'react';
import { useKeyStore } from '../stores/key_store';
import { CreateApiKeyRequest } from '../types/apiKey';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Key, ExternalLink, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardPage: React.FC = () => {
  const { keys, isLoading, error, fetchKeys, addKey, clearError } = useKeyStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    vendor: '',
    value: '',
    base_url: '',
    doc_url: '',
    code_snippets: '',
    tags: '',
    notes: '',
  });

  // Fetch keys on component mount
  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Handle form input changes
  const handleInputChange = (field: keyof CreateApiKeyRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || null
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addKey(formData);
      // Reset form and close dialog on success
      setFormData({
        name: '',
        vendor: '',
        value: '',
        base_url: '',
        doc_url: '',
        code_snippets: '',
        tags: '',
        notes: '',
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled in the store
      console.error('Failed to add key:', error);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Loading skeleton
  if (isLoading && keys.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Manager</h1>
          <p className="text-muted-foreground">
            Manage your API keys securely and efficiently
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Enter the details for your new API key. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., OpenAI Production"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vendor" className="text-right">
                    Vendor *
                  </Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., OpenAI"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    API Key *
                  </Label>
                  <Input
                    id="value"
                    type="password"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    className="col-span-3"
                    placeholder="sk-..."
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="base_url" className="text-right">
                    Base URL
                  </Label>
                  <Input
                    id="base_url"
                    value={formData.base_url || ''}
                    onChange={(e) => handleInputChange('base_url', e.target.value)}
                    className="col-span-3"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc_url" className="text-right">
                    Documentation
                  </Label>
                  <Input
                    id="doc_url"
                    value={formData.doc_url || ''}
                    onChange={(e) => handleInputChange('doc_url', e.target.value)}
                    className="col-span-3"
                    placeholder="https://platform.openai.com/docs"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags || ''}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="col-span-3"
                    placeholder="production, ai, gpt"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="col-span-3"
                    placeholder="Additional notes about this API key..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Key'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {keys.length === 0 && !isLoading ? (
        // Empty state
        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first API key
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Key
          </Button>
        </div>
      ) : (
        // Keys list
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {keys.map((key) => (
            <Card key={key.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{key.name}</CardTitle>
                    <CardDescription>{key.vendor}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(key.value)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">API Key</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {key.masked_value}
                    </code>
                  </div>
                  
                  {key.base_url && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Base URL</p>
                      <p className="text-sm truncate">{key.base_url}</p>
                    </div>
                  )}
                  
                  {key.doc_url && (
                    <div>
                      <a
                        href={key.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        Documentation
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {key.tags && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {key.tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {key.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{key.notes}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;