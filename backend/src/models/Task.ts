import mongoose, { Schema, Document } from 'mongoose';
import type { Task as TaskType, ColumnName } from '../types/index.js';

export interface ITask extends Document {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  columnId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

const TaskSchema = new Schema<ITask>({
  id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 200,
    trim: true 
  },
  description: { 
    type: String, 
    maxlength: 1000,
    trim: true 
  },
  assignedTo: { 
    type: String, 
    maxlength: 100,
    trim: true 
  },
  columnId: { 
    type: String, 
    required: true,
    enum: ['todo', 'inprogress', 'done'],
    index: true 
  },
  projectId: { 
    type: String, 
    required: true,
    index: true 
  },
  order: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0 
  }
}, {
  timestamps: true,
  collection: 'tasks'
});

// Compound indexes for better query performance
TaskSchema.index({ projectId: 1, columnId: 1, order: 1 });
TaskSchema.index({ projectId: 1, assignedTo: 1 });

// Pre-save middleware for validation
TaskSchema.pre('save', function(next) {
  // Ensure order is non-negative
  if (this.order < 0) {
    return next(new Error('Task order must be non-negative'));
  }
  
  next();
});

// Instance methods
TaskSchema.methods.moveToColumn = function(newColumnId: ColumnName, newOrder?: number) {
  this.columnId = newColumnId;
  if (newOrder !== undefined) {
    this.order = newOrder;
  }
  return this.save();
};

TaskSchema.methods.assignTo = function(assignee: string) {
  this.assignedTo = assignee;
  return this.save();
};

TaskSchema.methods.updateOrder = function(newOrder: number) {
  if (newOrder < 0) {
    throw new Error('Order must be non-negative');
  }
  this.order = newOrder;
  return this.save();
};

// Static methods
TaskSchema.statics.findByProjectId = function(projectId: string) {
  return this.find({ projectId }).sort({ columnId: 1, order: 1 });
};

TaskSchema.statics.findByColumn = function(projectId: string, columnId: ColumnName) {
  return this.find({ projectId, columnId }).sort({ order: 1 });
};

TaskSchema.statics.findByAssignee = function(projectId: string, assignedTo: string) {
  return this.find({ projectId, assignedTo }).sort({ columnId: 1, order: 1 });
};

TaskSchema.statics.findByTaskId = function(taskId: string) {
  return this.findOne({ id: taskId });
};

TaskSchema.statics.getMaxOrderInColumn = async function(projectId: string, columnId: ColumnName) {
  const result = await this.findOne({ projectId, columnId })
    .sort({ order: -1 })
    .select('order');
  return result ? result.order : -1;
};

TaskSchema.statics.reorderTasksInColumn = async function(
  projectId: string, 
  columnId: ColumnName, 
  taskOrders: { taskId: string; order: number }[]
) {
  const bulkOps = taskOrders.map(({ taskId, order }) => ({
    updateOne: {
      filter: { id: taskId, projectId, columnId },
      update: { order }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

export const Task = mongoose.model<ITask>('Task', TaskSchema);