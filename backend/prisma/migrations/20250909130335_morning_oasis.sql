@@ .. @@
 -- CreateEnum
 CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'PRACTITIONER', 'ADMIN');

 -- CreateEnum
 CREATE TYPE "AnimalGender" AS ENUM ('MALE', 'FEMALE');

 -- CreateEnum
 CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

 -- CreateEnum
 CREATE TYPE "ReminderType" AS ENUM ('APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER', 'FOLLOW_UP', 'BIRTHDAY');

+-- CreateEnum
+CREATE TYPE "TodoPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
+
 -- CreateTable
 CREATE TABLE "users" (
     "id" TEXT NOT NULL,
@@ .. @@
 CREATE TABLE "audit_logs" (
     "id" TEXT NOT NULL,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "userId" TEXT,
     "action" TEXT NOT NULL,
     "meta" JSONB,

     CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
 );

+-- CreateTable
+CREATE TABLE "todos" (
+    "id" TEXT NOT NULL,
+    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
+    "updatedAt" TIMESTAMP(3) NOT NULL,
+    "task" TEXT NOT NULL,
+    "priority" "TodoPriority" NOT NULL DEFAULT 'MEDIUM',
+    "dueDate" TIMESTAMP(3),
+    "description" TEXT,
+    "completed" BOOLEAN NOT NULL DEFAULT false,
+    "userId" TEXT NOT NULL,
+
+    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
+);
+
 -- CreateTable
 CREATE TABLE "_BlogPostToTag" (
     "A" TEXT NOT NULL,
@@ .. @@
 -- AddForeignKey
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

+-- AddForeignKey
+ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
+
 -- AddForeignKey
 ALTER TABLE "_BlogPostToTag" ADD CONSTRAINT "_BlogPostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;