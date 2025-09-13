// src/components/dashboard/forms/BlogForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { apiClient } from '../../../lib/api';

interface BlogFormData {
  title: string;
  titleFr: string;
  excerpt: string;
  excerptFr: string;
  content: string;
  contentFr: string;
  coverImage: string;
  published: boolean;
  seoTitle: string;
  seoTitleFr: string;
  seoDesc: string;
  seoDescFr: string;
}

interface BlogFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    titleFr: '',
    excerpt: '',
    excerptFr: '',
    content: '',
    contentFr: '',
    coverImage: '',
    published: false,
    seoTitle: '',
    seoTitleFr: '',
    seoDesc: '',
    seoDescFr: ''
  });

  const createBlogPostMutation = useMutation({
    mutationFn: (data: BlogFormData) => apiClient.createBlogPost(data),
    onSuccess: () => {
      onSuccess();
      setFormData({
        title: '',
        titleFr: '',
        excerpt: '',
        excerptFr: '',
        content: '',
        contentFr: '',
        coverImage: '',
        published: false,
        seoTitle: '',
        seoTitleFr: '',
        seoDesc: '',
        seoDescFr: ''
      });
    },
    onError: (error) => {
      console.error('Error creating blog post:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    createBlogPostMutation.mutate(formData);
  };

  const updateFormData = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-4">Create New Blog Post</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title (English) *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>
            <div>
              <Label htmlFor="titleFr">Title (French) *</Label>
              <Input
                id="titleFr"
                value={formData.titleFr}
                onChange={(e) => updateFormData('titleFr', e.target.value)}
                placeholder="Entrez le titre"
                required
              />
            </div>
          </div>

          {/* Excerpts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="excerpt">Excerpt (English)</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => updateFormData('excerpt', e.target.value)}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="excerptFr">Excerpt (French)</Label>
              <Textarea
                id="excerptFr"
                value={formData.excerptFr}
                onChange={(e) => updateFormData('excerptFr', e.target.value)}
                placeholder="Brève description..."
                rows={3}
              />
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="content">Content (English) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => updateFormData('content', e.target.value)}
                placeholder="Write your article content..."
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="contentFr">Content (French) *</Label>
              <Textarea
                id="contentFr"
                value={formData.contentFr}
                onChange={(e) => updateFormData('contentFr', e.target.value)}
                placeholder="Rédigez le contenu de votre article..."
                rows={6}
                required
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={formData.coverImage}
              onChange={(e) => updateFormData('coverImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* SEO Fields */}
          <div className="border-t dark:border-gray-600 pt-4 mt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">SEO Settings (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title (English)</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => updateFormData('seoTitle', e.target.value)}
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <Label htmlFor="seoTitleFr">SEO Title (French)</Label>
                <Input
                  id="seoTitleFr"
                  value={formData.seoTitleFr}
                  onChange={(e) => updateFormData('seoTitleFr', e.target.value)}
                  placeholder="Titre optimisé SEO"
                />
              </div>
              <div>
                <Label htmlFor="seoDesc">SEO Description (English)</Label>
                <Textarea
                  id="seoDesc"
                  value={formData.seoDesc}
                  onChange={(e) => updateFormData('seoDesc', e.target.value)}
                  placeholder="Meta description for search engines"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="seoDescFr">SEO Description (French)</Label>
                <Textarea
                  id="seoDescFr"
                  value={formData.seoDescFr}
                  onChange={(e) => updateFormData('seoDescFr', e.target.value)}
                  placeholder="Meta description pour les moteurs de recherche"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Publish checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => updateFormData('published', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
        </div>

        <div className="flex space-x-2 mt-6">
          <Button 
            type="submit"
            disabled={
              !formData.title.trim() || 
              !formData.titleFr.trim() || 
              !formData.content.trim() || 
              !formData.contentFr.trim() || 
              createBlogPostMutation.isPending
            }
          >
            {createBlogPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;