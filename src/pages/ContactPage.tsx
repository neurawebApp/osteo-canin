import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { 
  MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, 
  PaperAirplaneIcon, CheckCircleIcon, CalendarIcon, ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'Location',
      details: ['123 Veterinary Lane', 'Pet City, PC 12345'],
      action: 'Get Directions'
    },
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: ['+1 (555) 123-4567', 'WhatsApp Available'],
      action: 'Call Now'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['info@canineosteo.com', 'Response within 24h'],
      action: 'Send Email'
    },
    {
      icon: ClockIcon,
      title: 'Hours',
      details: ['Mon-Fri: 9:00 AM - 7:00 PM', 'Sat: 9:00 AM - 4:00 PM', 'Sun: Closed'],
      action: 'Book Online'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions about osteopathic treatment for your dog? We're here to help and provide expert guidance.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                        <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600 dark:text-gray-300">{detail}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Emergency Situations</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                  For urgent veterinary emergencies, please contact your veterinarian immediately. 
                  Osteopathy complements but does not replace emergency veterinary care.
                </p>
                <Button variant="outline" size="sm" className="border-red-300 dark:border-red-600 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30">
                  Find Emergency Vet
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl dark:text-white">Send Us a Message</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="dark:text-gray-200">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="dark:text-gray-200">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="dark:text-gray-200">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="dark:text-gray-200">Subject *</Label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                          <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                            <SelectItem value="general" className="dark:text-white dark:hover:bg-slate-700">General Inquiry</SelectItem>
                            <SelectItem value="booking" className="dark:text-white dark:hover:bg-slate-700">Booking Question</SelectItem>
                            <SelectItem value="treatment" className="dark:text-white dark:hover:bg-slate-700">Treatment Information</SelectItem>
                            <SelectItem value="pricing" className="dark:text-white dark:hover:bg-slate-700">Pricing & Services</SelectItem>
                            <SelectItem value="emergency" className="dark:text-white dark:hover:bg-slate-700">Urgent Care</SelectItem>
                            <SelectItem value="other" className="dark:text-white dark:hover:bg-slate-700">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="dark:text-gray-200">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Please describe your question or concern in detail..."
                        rows={6}
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? (
                        'Sending...'
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Thank you for your message. We'll get back to you within 24 hours.
                    </p>
                    <div className="space-x-4">
                      <Button onClick={() => setIsSubmitted(false)} variant="outline" className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
                        Send Another Message
                      </Button>
                      <Link to="/booking">
                        <Button className="dark:bg-blue-600 dark:hover:bg-blue-700">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <section className="mt-16">
          <Card className="overflow-hidden dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-0">
              <div className="bg-gray-200 dark:bg-slate-700 h-64 flex items-center justify-center">
                <div className="text-center text-gray-600 dark:text-gray-300">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Interactive Map</p>
                  <p className="text-sm">123 Veterinary Lane, Pet City, PC 12345</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;