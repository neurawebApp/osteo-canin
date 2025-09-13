// src/components/dashboard/BlogTab.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import BlogForm from './forms/BlogForm';
import { apiClient } from '../../lib/api';
import type { BlogPost } from '../../types/dashboard';

interface BlogTabProps {
  blogPosts: BlogPost[];
  refetchBlogPosts: () => void;
}

const BlogTab: React.FC<BlogTabProps> = ({ blogPosts, refetchBlogPosts }) => {
  const [showNewBlogForm, setShowNewBlogForm] = useState(false);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

  const deleteBlogPostMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBlogPost(id),
    onSuccess: () => refetchBlogPosts()
  });

  const handleDeleteBlogPost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      setDeletingPost(postId);
      try {
        await deleteBlogPostMutation.mutateAsync(postId);
      } catch (error) {
        console.error('Error deleting blog post:', error);
      } finally {
        setDeletingPost(null);
      }
    }
  };

  const handleFormSuccess = () => {
    refetchBlogPosts();
    setShowNewBlogForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <PencilIcon className="h-5 w-5 mr-2" />
            Blog Management
          </CardTitle>
          <Button onClick={() => setShowNewBlogForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Create Blog Post Form */}
        {showNewBlogForm && (
          <BlogForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowNewBlogForm(false)}
          />
        )}

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <div 
              key={post.id} 
              className="border dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    <Badge 
                      className={
                        post.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                    {post.author && (
                      <span> by {post.author.firstName} {post.author.lastName}</span>
                    )}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-2">
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log('Edit post:', post.id);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBlogPost(post.id)}
                    disabled={deletingPost === post.id || deleteBlogPostMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingPost === post.id ? (
                      'Deleting...'
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {blogPosts.length === 0 && (
            <div className="text-center py-8">
              <PencilIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No blog posts yet</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowNewBlogForm(true)}
              >
                Create Your First Article
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogTab;