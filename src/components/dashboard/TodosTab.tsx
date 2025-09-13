// src/components/dashboard/TodosTab.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PlusIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import TodoForm from './forms/TodoForm';
import { getPriorityColor } from '../../utils/colorUtils';
import { apiClient } from '../../lib/api';
import type { Todo } from '../../types/dashboard';

interface TodosTabProps {
  todos: Todo[];
  refetchTodos: () => void;
}

const TodosTab: React.FC<TodosTabProps> = ({ todos, refetchTodos }) => {
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);

  const toggleTodoMutation = useMutation({
    mutationFn: (id: string) => apiClient.toggleTodo(id),
    onSuccess: () => refetchTodos()
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTodo(id),
    onSuccess: () => refetchTodos()
  });

  const handleToggleTodo = (todoId: string) => {
    toggleTodoMutation.mutate(todoId);
  };

  const handleDeleteTodo = (todoId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTodoMutation.mutate(todoId);
    }
  };

  const handleFormSuccess = () => {
    refetchTodos();
    setShowNewTodoForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Tasks & To-Do
          </CardTitle>
          <Button onClick={() => setShowNewTodoForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showNewTodoForm && (
          <TodoForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowNewTodoForm(false)}
          />
        )}

        <div className="space-y-3">
          {todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`
                flex items-center space-x-3 p-3 rounded-lg border dark:border-gray-700 
                ${todo.completed 
                  ? 'bg-gray-50 dark:bg-gray-800 opacity-75' 
                  : 'bg-white dark:bg-gray-900'
                }
              `}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
                className="h-4 w-4 text-blue-600 rounded"
                disabled={toggleTodoMutation.isPending}
              />
              <div className="flex-1">
                <p className={`
                  font-medium 
                  ${todo.completed 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {todo.task}
                </p>
                {todo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {todo.description}
                  </p>
                )}
                {todo.dueDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Badge className={getPriorityColor(todo.priority)}>
                {todo.priority}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteTodo(todo.id)}
                disabled={deleteTodoMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowNewTodoForm(true)}
              >
                Create Your First Task
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodosTab;