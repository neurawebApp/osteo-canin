// src/pages/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  HeartIcon, AcademicCapIcon, UserGroupIcon, 
  ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, TrophyIcon, ShieldCheckIcon, StarIcon 
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  const qualifications = [
    {
      title: 'Diploma in Canine Osteopathy',
      institution: 'International College of Animal Osteopathy',
      year: '2018',
      type: 'Primary Qualification'
    },
    {
      title: 'Canine Anatomy & Physiology Certificate',
      institution: 'Veterinary Training Institute',
      year: '2017',
      type: 'Foundation'
    },
    {
      title: 'Sports Dog Therapy Specialist',
      institution: 'Advanced Canine Therapy Center',
      year: '2020',
      type: 'Specialization'
    },
    {
      title: 'Continuing Professional Development',
      institution: 'Various Institutions',
      year: 'Annual',
      type: 'Ongoing'
    }
  ];

  const memberships = [
    'International Association of Animal Osteopaths (IAAO)',
    'Canine Therapy Professionals Network',
    'Veterinary Complementary Medicine Society',
    'Regional Pet Health Alliance'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Dr. Sarah Johnson, Certified Canine Osteopath
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Dedicated to Your Dog's
                <span className="text-blue-600 dark:text-blue-400 block">Health & Mobility</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                With over 7 years of experience in canine osteopathy, I'm passionate about helping dogs 
                live pain-free, active lives through gentle, effective treatment approaches.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                  500+ Dogs Treated
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                  4.9/5 Rating
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 text-green-600" />
                  7+ Years Experience
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-3xl p-8">
                <img
                  src="https://images.pexels.com/photos/4269365/pexels-photo-4269365.jpeg"
                  alt="Dr. Sarah Johnson with a patient"
                  className="rounded-2xl shadow-lg w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Qualifications
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive training and ongoing education in canine osteopathy and animal health
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {qualifications.map((qual, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <AcademicCapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{qual.title}</h3>
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{qual.type}</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{qual.institution}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed: {qual.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Memberships */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Memberships
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Active member of leading professional organizations in animal therapy
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {memberships.map((membership, index) => (
              <div key={index} className="flex items-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                <span className="text-gray-800 dark:text-gray-200">{membership}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-blue-50 dark:bg-blue-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              My Treatment Philosophy
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-white dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <HeartIcon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Gentle Care</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Every treatment is approached with patience, understanding, and respect for your dog's comfort and wellbeing.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <TrophyIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Evidence-Based</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All treatments are based on the latest research and proven osteopathic techniques adapted for canine anatomy.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <UserGroupIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Collaborative</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Working closely with veterinarians and pet owners to ensure comprehensive care and optimal outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Help Your Dog?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Schedule a consultation to discuss your dog's specific needs and create a personalized treatment plan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50 dark:bg-gray-200 dark:text-blue-700 dark:hover:bg-gray-100">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Book Consultation
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 dark:hover:bg-gray-100 dark:hover:text-blue-700">
                <PhoneIcon className="mr-2 h-5 w-5" />
                Call Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;