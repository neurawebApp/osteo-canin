// src/pages/BlogPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { CalendarIcon, ClockIcon, ArrowRightIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

const BlogPage: React.FC = () => {
  const { data: blogData, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => apiClient.getBlogPosts(true)
  });

  const blogPosts = blogData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const featuredPost = blogPosts.slice(0, 1)[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Canine Health & Wellness Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Expert insights, tips, and guidance for keeping your dog healthy, mobile, and happy throughout their life
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search articles..."
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">All</Badge>
              {blogPosts.flatMap((post: any) => post.tags || []).map((tag: any) => (
                <Badge key={tag.name} variant="outline" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge className="bg-blue-600 text-white dark:bg-blue-500">Featured Article</Badge>
            </div>
            <Card className="overflow-hidden shadow-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <div className="grid lg:grid-cols-2">
                <div className="relative h-64 lg:h-full">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(featuredPost.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      8 min read
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {featuredPost.tags?.map((tag: any) => (
                        <Badge key={tag.name} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{tag.name}</Badge>
                      ))}
                    </div>
                    <Link to={`/blog/${featuredPost.slug}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                        Read More
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Other Posts */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post: any) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <div className="relative overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100">
                      {post.tags?.[0]?.name}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      6 min read
                    </div>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {post.tags?.slice(1, 3).map((tag: any) => (
                        <Badge key={tag.name} variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600">
                        Read More
                        <ArrowRightIcon className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 rounded-2xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Stay Updated on Canine Health
            </h2>
            <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
              Get the latest tips, insights, and updates on canine osteopathy and wellness delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white text-gray-900 border-0 placeholder:text-gray-500"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50 dark:bg-gray-200 dark:text-blue-700 dark:hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;