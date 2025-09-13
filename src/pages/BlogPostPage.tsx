// src/pages/BlogPostPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeftIcon, ShareIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: postData, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => apiClient.getBlogPostBySlug(slug!),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const post = postData?.data;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
          <Link to="/blog">
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth">
      {/* Article Header */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link to="/blog">
                <Button variant="ghost" className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  5 min read
                </div>
                {post.author && (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {post.author.firstName} {post.author.lastName}
                  </div>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2">
                  {post.tags?.map((tag: any) => (
                    <Badge key={tag.name} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{tag.name}</Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {post.coverImage && (
              <div className="relative mb-12">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {post.excerpt && (
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  {post.excerpt}
                </p>
              )}
              
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
              />

              <div className="text-center mt-12 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Help Your Dog?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Schedule a consultation to discuss your dog's specific needs.
                </p>
                <Link to="/booking">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-6">
                  <img
                    src="https://images.pexels.com/photos/6816856/pexels-photo-6816856.jpeg"
                    alt="Canine osteopathy"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Understanding Canine Osteopathy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Learn about gentle, hands-on treatment approaches...</p>
                  <Link to="/blog/understanding-canine-osteopathy">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-6">
                  <img
                    src="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg"
                    alt="Senior dog care"
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Senior Dog Care Tips</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Essential tips for caring for older dogs...</p>
                  <Link to="/blog/senior-dog-care-tips">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">Read More</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;