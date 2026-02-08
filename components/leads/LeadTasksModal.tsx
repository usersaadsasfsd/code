'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';
import { CheckSquare, Plus, Calendar, Clock, User, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

interface LeadTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}

export function LeadTasksModal({ open, onOpenChange, lead }: LeadTasksModalProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Follow up call',
      description: 'Call to discuss property requirements',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      priority: 'High',
      status: 'Pending',
      assignedTo: user?.name || 'Current User',
      createdBy: user?.name || 'Current User',
      createdAt: new Date(),
    },
    {
      id: 'task-2',
      title: 'Send property brochures',
      description: 'Email property details and brochures',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Completed',
      assignedTo: user?.name || 'Current User',
      createdBy: user?.name || 'Current User',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completedAt: new Date(),
    },
  ]); // Initialize with existing lead tasks
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(user?.id || '');

  // Helper to get color for lead type (reused from LeadProfile.tsx logic)
  const getLeadTypeColor = (type: 'Lead' | 'Cold-Lead') => {
    switch (type) {
      case 'Lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cold-Lead': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: 'Pending' | 'In Progress' | 'Completed') => {
    switch (status) {
      case 'Pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDueDate) return;

    const newTask: Task = {
      id: `${lead.id}-task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: new Date(newTaskDueDate),
      priority: newTaskPriority,
      status: 'Pending',
      assignedTo: newTaskAssignedTo,
      createdBy: user?.id || 'unknown',
      createdAt: new Date(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    // In a real app, you'd also send this update to your backend
    // onUpdateLead({ ...lead, tasks: updatedTasks }); // Assuming onUpdateLead could update tasks directly
    
    // Clear form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setNewTaskPriority('Medium');
    setNewTaskAssignedTo(user?.id || '');
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: currentStatus === 'Completed' ? 'Pending' : 'Completed',
            completedAt: currentStatus === 'Completed' ? undefined : new Date(),
          } 
        : task
    ));
    // In a real app, you'd send this update to your backend
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatDueDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const isOverdue = (task: Task) => {
    return task.status !== 'Completed' && new Date(task.dueDate) < new Date();
  };

  // Sort tasks: In Progress/Pending (overdue first), then Completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'Completed' && b.status !== 'Completed') return 1;
    if (a.status !== 'Completed' && b.status === 'Completed') return -1;
    
    // For non-completed tasks, overdue tasks come first
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); // Sort by due date
  });


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Tasks for {lead.name}</span>
            {lead.leadType && (
                <Badge variant="outline" className={`${getLeadTypeColor(lead.leadType)} font-medium`}>
                    {lead.leadType.replace('-', ' ')}
                </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage and track all tasks related to this lead.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Add New Task Form */}
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Plus className="h-5 w-5" />
                <span>Add New Task</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  placeholder="e.g., Follow up on site visit"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taskDescription">Description (Optional)</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="Add more details about the task..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(value: 'Low' | 'Medium' | 'High') => setNewTaskPriority(value)}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* You might want to add an assignedTo select here if users can assign tasks to others */}
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim() || !newTaskDueDate} className="bg-blue-600 hover:bg-blue-700 w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>

          {/* Existing Tasks List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Tasks</h3>
            {sortedTasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTasks.map(task => (
                  <Card key={task.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={task.status === 'Completed'} 
                            onCheckedChange={() => handleToggleTaskStatus(task.id, task.status)}
                            className="w-5 h-5"
                          />
                          <div>
                            <p className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right space-y-1">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                          
                          <div className={`text-xs flex items-center space-x-1 ${isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {isOverdue(task) && <AlertCircle className="h-3 w-3" />}
                            <Clock className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                          
                          {task.completedAt && (
                            <div className="text-xs text-green-600">
                              Completed {formatDate(task.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No tasks created yet</p>
                <p className="text-sm mt-1">Add your first task to get started</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
