import { PrismaClient, UserRole, AnimalGender, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@canineosteopath.com' },
    update: {},
    create: {
      email: 'admin@canineosteopath.com',
      password: adminPassword,
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0123',
      role: UserRole.ADMIN,
    },
  });

  // Create client user
  const clientPassword = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: clientPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-0456',
      role: UserRole.CLIENT,
    },
  });

  // Create services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        title: 'Initial Consultation',
        titleFr: 'Consultation Initiale',
        description: 'Comprehensive assessment of your dog\'s musculoskeletal health',
        descriptionFr: 'Évaluation complète de la santé musculo-squelettique de votre chien',
        duration: 60,
        price: 120.00,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        title: 'Follow-up Treatment',
        titleFr: 'Traitement de Suivi',
        description: 'Targeted treatment session based on previous assessment',
        descriptionFr: 'Séance de traitement ciblée basée sur l\'évaluation précédente',
        duration: 45,
        price: 90.00,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        title: 'Sports Dog Assessment',
        titleFr: 'Évaluation Chien de Sport',
        description: 'Specialized assessment for athletic and working dogs',
        descriptionFr: 'Évaluation spécialisée pour les chiens athlétiques et de travail',
        duration: 75,
        price: 150.00,
        active: true,
      },
    }),
  ]);

  // Create animals
  const animal = await prisma.animal.upsert({
    where: { id: 'animal-1' },
    update: {},
    create: {
      id: 'animal-1',
      name: 'Max',
      breed: 'Golden Retriever',
      age: 5,
      weight: 30.5,
      gender: AnimalGender.MALE,
      notes: 'Very friendly, slight hip sensitivity',
      ownerId: client.id,
    },
  });

  // Create blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: 'understanding-canine-osteopathy' },
      update: {},
      create: {
        slug: 'understanding-canine-osteopathy',
        title: 'Understanding Canine Osteopathy: A Holistic Approach to Dog Health',
        titleFr: 'Comprendre l\'Ostéopathie Canine: Une Approche Holistique de la Santé du Chien',
        excerpt: 'Learn how osteopathy can improve your dog\'s quality of life through gentle, non-invasive treatments.',
        excerptFr: 'Découvrez comment l\'ostéopathie peut améliorer la qualité de vie de votre chien grâce à des traitements doux et non invasifs.',
        content: `# Understanding Canine Osteopathy

Canine osteopathy is a gentle, holistic approach to treating musculoskeletal problems in dogs. This comprehensive guide will help you understand how osteopathic treatment can benefit your furry friend.

## What is Canine Osteopathy?

Osteopathy for dogs involves the assessment and treatment of the musculoskeletal system using hands-on techniques. Our trained practitioners use their knowledge of anatomy and physiology to identify and treat restrictions in movement that may be causing pain or discomfort.

## Benefits for Your Dog

- Pain relief without medication
- Improved mobility and flexibility
- Enhanced performance for working dogs
- Faster recovery from injuries
- Better quality of life for senior dogs

## When to Consider Osteopathic Treatment

Consider bringing your dog for an osteopathic assessment if you notice:
- Limping or favoring one leg
- Stiffness, especially after rest
- Reluctance to jump or climb stairs
- Changes in gait or posture
- Behavioral changes that might indicate discomfort

## Our Approach

Every treatment begins with a thorough assessment of your dog's movement patterns, posture, and any areas of restriction. We then use gentle, hands-on techniques to restore normal function and reduce pain.`,
        contentFr: `# Comprendre l'Ostéopathie Canine

L'ostéopathie canine est une approche douce et holistique pour traiter les problèmes musculo-squelettiques chez les chiens...`,
        coverImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
        published: true,
        authorId: admin.id,
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'senior-dog-care-tips' },
      update: {},
      create: {
        slug: 'senior-dog-care-tips',
        title: '5 Essential Tips for Senior Dog Care',
        titleFr: '5 Conseils Essentiels pour les Soins aux Chiens Âgés',
        excerpt: 'Help your aging companion stay comfortable and active with these expert-recommended care strategies.',
        excerptFr: 'Aidez votre compagnon vieillissant à rester confortable et actif avec ces stratégies de soins recommandées par des experts.',
        content: `# 5 Essential Tips for Senior Dog Care

As our beloved companions age, their needs change. Here are five essential tips to help your senior dog maintain comfort and quality of life.

## 1. Regular Health Monitoring

Senior dogs should have more frequent veterinary check-ups to catch health issues early. Watch for changes in appetite, energy levels, and mobility.

## 2. Comfortable Sleeping Areas

Provide orthopedic bedding to support aging joints. Consider heated beds for dogs with arthritis.

## 3. Gentle Exercise

Maintain regular, low-impact exercise to keep joints mobile. Swimming is excellent for senior dogs.

## 4. Nutritional Support

Senior dogs may benefit from joint supplements and adjusted nutrition to maintain healthy weight.

## 5. Pain Management

Work with your veterinarian and consider complementary therapies like osteopathy for natural pain relief.`,
        contentFr: `# 5 Conseils Essentiels pour les Soins aux Chiens Âgés...`,
        coverImage: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg',
        published: true,
        authorId: admin.id,
      },
    }),
  ]);

  // Create sample appointment
  const appointment = await prisma.appointment.create({
    data: {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
      status: AppointmentStatus.SCHEDULED,
      notes: 'First consultation for Max',
      clientId: client.id,
      animalId: animal.id,
      serviceId: services[0].id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user:', admin.email, '/ admin123');
  console.log('👤 Client user:', client.email, '/ client123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });