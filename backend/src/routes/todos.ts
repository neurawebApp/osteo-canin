// backend/src/routes/todos.ts
import { Router } from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';
import { UserRole, TodoPriority } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const createTodoSchema = z.object({
  task: z.string().min(1, 'Task is required'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

const updateTodoSchema = z.object({
  task: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

// Get user's todos
router.get('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Fetching todos for user:', req.user!.id);
      const todos = await prisma.todo.findMany({
        where: { userId: req.user!.id },
        orderBy: [
          { completed: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      console.log('Found todos:', todos.length);
      const transformedTodos = todos.map(todo => ({
        id: todo.id,
        task: todo.task,
        completed: todo.completed,
        priority: todo.priority.toLowerCase(),
        dueDate: todo.dueDate?.toISOString(),
        description: todo.description,
        createdAt: todo.createdAt.toISOString()
      }));

      res.json({ data: transformedTodos });
    } catch (error: any) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }
);

// Create new todo
router.post('/', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      console.log('Creating todo:', req.body);
      const validatedData = createTodoSchema.parse(req.body);
      
      const todo = await prisma.todo.create({
        data: {
          task: validatedData.task,
          priority: validatedData.priority as TodoPriority,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
          description: validatedData.description,
          userId: req.user!.id
        }
      });

      console.log('Created todo:', todo);
      const transformedTodo = {
        id: todo.id,
        task: todo.task,
        completed: todo.completed,
        priority: todo.priority.toLowerCase(),
        dueDate: todo.dueDate?.toISOString(),
        description: todo.description,
        createdAt: todo.createdAt.toISOString()
      };

      res.status(201).json({
        data: transformedTodo,
        message: 'Todo created successfully'
      });
    } catch (error: any) {
      console.error('Error creating todo:', error);
      res.status(400).json({
        error: error.message || 'Failed to create todo'
      });
    }
  }
);

// Update todo
router.put('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Updating todo:', id, req.body);
      const validatedData = updateTodoSchema.parse(req.body);
      
      const updateData: any = {};
      if (validatedData.task !== undefined) updateData.task = validatedData.task;
      if (validatedData.priority !== undefined) updateData.priority = validatedData.priority as TodoPriority;
      if (validatedData.dueDate !== undefined) updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.completed !== undefined) updateData.completed = validatedData.completed;

      const todo = await prisma.todo.update({
        where: { 
          id,
          userId: req.user!.id 
        },
        data: updateData
      });

      console.log('Updated todo:', todo);
      const transformedTodo = {
        id: todo.id,
        task: todo.task,
        completed: todo.completed,
        priority: todo.priority.toLowerCase(),
        dueDate: todo.dueDate?.toISOString(),
        description: todo.description,
        createdAt: todo.createdAt.toISOString()
      };

      res.json({
        data: transformedTodo,
        message: 'Todo updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating todo:', error);
      res.status(400).json({
        error: error.message || 'Failed to update todo'
      });
    }
  }
);

// Toggle todo completion
router.put('/:id/toggle', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Toggling todo:', id);
      
      const currentTodo = await prisma.todo.findFirst({
        where: { 
          id,
          userId: req.user!.id 
        }
      });

      if (!currentTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      const todo = await prisma.todo.update({
        where: { id },
        data: { completed: !currentTodo.completed }
      });

      console.log('Toggled todo:', todo);
      const transformedTodo = {
        id: todo.id,
        completed: todo.completed,
        updatedAt: todo.updatedAt.toISOString()
      };

      res.json({
        data: transformedTodo,
        message: 'Todo toggled successfully'
      });
    } catch (error: any) {
      console.error('Error toggling todo:', error);
      res.status(400).json({
        error: 'Failed to toggle todo'
      });
    }
  }
);

// Delete todo
router.delete('/:id', 
  authenticateToken, 
  requireRole([UserRole.ADMIN, UserRole.PRACTITIONER]), 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      console.log('Deleting todo:', id);
      
      await prisma.todo.delete({
        where: { 
          id,
          userId: req.user!.id 
        }
      });

      console.log('Deleted todo:', id);
      res.json({
        message: 'Todo deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting todo:', error);
      res.status(400).json({
        error: 'Failed to delete todo'
      });
    }
  }
);

export default router;