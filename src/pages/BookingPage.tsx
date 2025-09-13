// src/pages/BookingPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

type BookingStep = 'service' | 'animal' | 'datetime' | 'details' | 'confirmation';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  
  // Fetch services dynamically
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => apiClient.getServices(true)
  });

  const services = servicesData?.data || [];
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    animalName: '',
    animalBreed: '',
    animalAge: '',
    animalWeight: '',
    animalGender: 'MALE' as 'MALE' | 'FEMALE',
    selectedDate: '',
    selectedTime: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });

  const selectedService = services.find(s => s.id === formData.serviceId);

  // Mutation for creating animal
  const createAnimalMutation = useMutation({
    mutationFn: (animalData: any) => apiClient.createAnimal(animalData),
    onError: (error) => {
      console.error('Error creating animal:', error);
    }
  });

  // Mutation for creating appointment
  const createAppointmentMutation = useMutation({
    mutationFn: (appointmentData: any) => apiClient.createAppointment(appointmentData),
    onError: (error) => {
      console.error('Error creating appointment:', error);
    }
  });

  const handleNext = () => {
    const steps: BookingStep[] = ['service', 'animal', 'datetime', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['service', 'animal', 'datetime', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First, create the animal
      const animalData = {
        name: formData.animalName,
        breed: formData.animalBreed,
        age: parseInt(formData.animalAge),
        weight: parseFloat(formData.animalWeight),
        gender: formData.animalGender,
        notes: `Owner: ${formData.clientName} (${formData.clientEmail})`
      };

      console.log('Creating animal:', animalData);
      const animalResponse = await createAnimalMutation.mutateAsync(animalData);
      
      // Then, create the appointment
      const appointmentDateTime = new Date(`${formData.selectedDate}T${formData.selectedTime}:00`);
      
      const appointmentData = {
        serviceId: formData.serviceId,
        animalId: animalResponse.data.id,
        startTime: appointmentDateTime.toISOString(),
        notes: formData.notes || `Contact: ${formData.clientName} - ${formData.clientPhone} - ${formData.clientEmail}`
      };

      console.log('Creating appointment:', appointmentData);
      const appointmentResponse = await createAppointmentMutation.mutateAsync(appointmentData);
      
      setCreatedAppointmentId(appointmentResponse.data.id);
      setCurrentStep('confirmation');
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['Service', 'Animal', 'Date & Time', 'Details', 'Confirmation'].map((step, index) => {
                const stepKeys: BookingStep[] = ['service', 'animal', 'datetime', 'details', 'confirmation'];
                const isActive = stepKeys[index] === currentStep;
                const isCompleted = stepKeys.indexOf(currentStep) > index;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }
                    `}>
                      {isCompleted ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 4 && (
                      <div className={`w-16 h-1 mx-2 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Book Your Appointment</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Step {['service', 'animal', 'datetime', 'details', 'confirmation'].indexOf(currentStep) + 1} of 5
              </p>
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8">
              {currentStep === 'service' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Select Your Service</h2>
                  {servicesLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {services.map((service: any) => (
                        <div
                          key={service.id}
                          className={`
                            border rounded-lg p-4 cursor-pointer transition-all duration-200
                            ${formData.serviceId === service.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-gray-700'
                            }
                          `}
                          onClick={() => setFormData(prev => ({ ...prev, serviceId: service.id }))}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{service.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {service.duration} min
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">€{service.price}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'animal' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tell Us About Your Dog</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="animalName" className="text-gray-900 dark:text-gray-100">Dog's Name *</Label>
                      <Input
                        id="animalName"
                        value={formData.animalName}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        placeholder="e.g., Max"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="animalBreed" className="text-gray-900 dark:text-gray-100">Breed *</Label>
                      <Input
                        id="animalBreed"
                        value={formData.animalBreed}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalBreed: e.target.value }))}
                        placeholder="e.g., Golden Retriever"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="animalAge" className="text-gray-900 dark:text-gray-100">Age (years) *</Label>
                      <Input
                        id="animalAge"
                        value={formData.animalAge}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalAge: e.target.value }))}
                        placeholder="e.g., 3"
                        type="number"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="animalWeight" className="text-gray-900 dark:text-gray-100">Weight (kg) *</Label>
                      <Input
                        id="animalWeight"
                        value={formData.animalWeight}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalWeight: e.target.value }))}
                        placeholder="e.g., 25"
                        type="number"
                        step="0.1"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-900 dark:text-gray-100">Gender *</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center text-gray-900 dark:text-gray-100">
                          <input
                            type="radio"
                            value="MALE"
                            checked={formData.animalGender === 'MALE'}
                            onChange={(e) => setFormData(prev => ({ ...prev, animalGender: 'MALE' }))}
                            className="mr-2 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                          />
                          Male
                        </label>
                        <label className="flex items-center text-gray-900 dark:text-gray-100">
                          <input
                            type="radio"
                            value="FEMALE"
                            checked={formData.animalGender === 'FEMALE'}
                            onChange={(e) => setFormData(prev => ({ ...prev, animalGender: 'FEMALE' }))}
                            className="mr-2 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
                          />
                          Female
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'datetime' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Choose Date & Time</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Select Date</Label>
                      <div className="mt-2 grid grid-cols-7 gap-2">
                        {Array.from({ length: 14 }, (_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + i + 1);
                          const dateStr = date.toISOString().split('T')[0];
                          const isSelected = formData.selectedDate === dateStr;
                          
                          return (
                            <Button
                              key={i}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              className={`h-12 ${
                                isSelected 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : 'dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, selectedDate: dateStr }))}
                            >
                              <div className="text-center">
                                <div className="text-xs">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                                <div className="font-semibold">{date.getDate()}</div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Select Time</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={formData.selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            className={
                              formData.selectedTime === time 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700'
                            }
                            onClick={() => setFormData(prev => ({ ...prev, selectedTime: time }))}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {selectedService && formData.selectedDate && formData.selectedTime && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border dark:border-blue-800 rounded-lg">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Booking Summary</h3>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p><strong>Service:</strong> {selectedService.title}</p>
                        <p><strong>Duration:</strong> {selectedService.duration} minutes</p>
                        <p><strong>Price:</strong> €{selectedService.price}</p>
                        <p><strong>Date:</strong> {new Date(formData.selectedDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {formData.selectedTime}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'details' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Contact Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clientName" className="text-gray-900 dark:text-gray-100">Your Name *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter your full name"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail" className="text-gray-900 dark:text-gray-100">Email Address *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="clientPhone" className="text-gray-900 dark:text-gray-100">Phone Number *</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                        placeholder="+33 1 23 45 67 89"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes" className="text-gray-900 dark:text-gray-100">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any specific concerns, symptoms, or information about your dog..."
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'confirmation' && (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 dark:text-gray-400">Your appointment has been successfully scheduled.</p>
                  </div>
                  
                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 max-w-md mx-auto mb-6">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Appointment Details</h3>
                      <div className="text-left space-y-2 text-sm">
                        <p className="text-blue-800 dark:text-blue-200"><strong>Service:</strong> {selectedService?.title}</p>
                        <p className="text-blue-800 dark:text-blue-200"><strong>Dog:</strong> {formData.animalName} ({formData.animalBreed})</p>
                        <p className="text-blue-800 dark:text-blue-200"><strong>Date:</strong> {new Date(formData.selectedDate).toLocaleDateString()}</p>
                        <p className="text-blue-800 dark:text-blue-200"><strong>Time:</strong> {formData.selectedTime}</p>
                        <p className="text-blue-800 dark:text-blue-200"><strong>Duration:</strong> {selectedService?.duration} minutes</p>
                        <p className="text-blue-800 dark:text-blue-200"><strong>Total Cost:</strong> €{selectedService?.price}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A confirmation will be sent to {formData.clientEmail}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                        Go to Dashboard
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/')} className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
                        Return Home
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep !== 'confirmation' && (
                <div className="flex justify-between mt-8 pt-6 border-t dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 'service'}
                    className="flex items-center dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  {currentStep === 'details' ? (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || !formData.clientName || !formData.clientEmail || !formData.clientPhone}
                      className="flex items-center bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Creating...' : 'Confirm Booking'}
                      {!isSubmitting && <CheckCircleIcon className="h-4 w-4 ml-2" />}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      disabled={
                        (currentStep === 'service' && !formData.serviceId) ||
                        (currentStep === 'animal' && (!formData.animalName || !formData.animalBreed || !formData.animalAge || !formData.animalWeight)) ||
                        (currentStep === 'datetime' && (!formData.selectedDate || !formData.selectedTime))
                      }
                      className="flex items-center bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;