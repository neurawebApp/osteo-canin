// src/pages/HomePage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StarIcon, HeartIcon, ShieldCheckIcon, ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  // Fetch services dynamically
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiClient.getServices(true)
  });

  // Fetch blog posts for testimonials section
  const { data: blogData } = useQuery({
    queryKey: ['blog-posts-preview'],
    queryFn: () => apiClient.getBlogPosts(true)
  });

  const services = servicesData?.data || [];
  const blogPosts = blogData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 scroll-smooth">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                Certified Canine Osteopath
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Professional Osteopathy for Your
                <span className="text-blue-600 dark:text-blue-400 block">Beloved Dogs</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Gentle, hands-on treatment to help your dog move better, feel better, and live their best life. 
                Expert care for musculoskeletal issues, pain management, and overall wellness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-3xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                <img
                  src="https://images.pexels.com/photos/6816856/pexels-photo-6816856.jpeg"
                  alt="Dog receiving gentle osteopathic treatment"
                  className="rounded-2xl shadow-lg w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <HeartIcon className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">500+ Happy Dogs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Specialized Treatment Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive osteopathic care tailored to your dog's specific needs and conditions
            </p>
          </div>
          
          {servicesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {services.slice(0, 3).map((service: any, index: number) => (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{service.price}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{service.duration} min</div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {/* Mock features for display */}
                      {['Professional assessment', 'Gentle treatment', 'Follow-up care', 'Expert guidance'].map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/booking">
                      <Button className="w-full group-hover:bg-blue-700 bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600">
                        Book This Service
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Testimonials from Blog Comments */}
      <section className="py-16 bg-blue-50 dark:bg-blue-900/20 snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Latest from Our Blog
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post: any) => (
              <Card key={post.id} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{post.excerpt || 'Great insights on canine health and wellness.'}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {post.author ? `${post.author.firstName[0]}${post.author.lastName[0]}` : 'AU'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <Link to={`/blog/${post.slug}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          Read Article
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Our Clients Say */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                dogName: "Max",
                rating: 5,
                text: "Amazing results! Max was limping for weeks, and after just two sessions, he's back to his playful self. The treatment was so gentle and professional."
              },
              {
                name: "James Wilson",
                dogName: "Luna", 
                rating: 5,
                text: "Luna is a senior dog with arthritis. The osteopathic treatment has significantly improved her mobility and quality of life. Highly recommended!"
              },
              {
                name: "Emma Thompson",
                dogName: "Charlie",
                rating: 5,
                text: "Professional, caring, and effective. Charlie loves his visits here! The follow-up care and advice have been invaluable for his ongoing health."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Owner of {testimonial.dogName}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose CanineOsteo?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Professional expertise combined with genuine care for your dog's wellbeing
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: TrophyIcon,
                title: "Certified Expert",
                description: "Fully qualified and certified canine osteopath with extensive training"
              },
              {
                icon: HeartIcon,
                title: "Gentle Approach",
                description: "Stress-free treatment using calm, patient handling techniques"
              },
              {
                icon: UserGroupIcon,
                title: "500+ Happy Clients",
                description: "Trusted by dog owners across the region for over 5 years"
              },
              {
                icon: ClockIcon,
                title: "Flexible Scheduling",
                description: "Convenient appointment times including evenings and weekends"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700 snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Help Your Dog Feel Better?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Book your consultation today and take the first step towards improving your dog's health and mobility
          </p>
          <Link to="/booking">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50 dark:bg-gray-200 dark:text-blue-700 dark:hover:bg-gray-100">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Schedule Consultation
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-gray-900 dark:bg-gray-950 text-white snap-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <MapPinIcon className="h-5 w-5 mr-2 text-blue-400" />
              <span>123 Veterinary Lane, Pet City, PC 12345</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <PhoneIcon className="h-5 w-5 mr-2 text-blue-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-400" />
              <span>info@canineosteo.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;