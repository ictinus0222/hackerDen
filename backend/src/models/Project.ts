import mongoose, { Schema, Document } from 'mongoose';
import { ProjectHub, TeamMember, JudgingCriterion, PivotEntry } from '../types/index.js';

// Subdocument schemas
const TeamMemberSchema = new Schema<TeamMember>({
  id: { type: String, required: true },
  name: { type: String, required: true, maxlength: 100 },
  role: { type: String, maxlength: 50 },
  joinedAt: { type: Date, required: true, default: Date.now }
}, { _id: false });

const JudgingCriterionSchema = new Schema<JudgingCriterion>({
  id: { type: String, required: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  completed: { type: Boolean, required: true, default: false }
}, { _id: false });

const PivotEntrySchema = new Schema<PivotEntry>({
  id: { type: String, required: true },
  description: { type: String, required: true, maxlength: 1000 },
  reason: { type: String, required: true, maxlength: 1000 },
  timestamp: { type: Date, required: true, default: Date.now }
}, { _id: false });

// Main Project schema
export interface IProject extends Document {
  projectId: string;
  projectName: string;
  oneLineIdea: string;
  teamMembers: TeamMember[];
  deadlines?: {
    hackingEnds: Date;
    submissionDeadline: Date;
    presentationTime: Date;
  };
  judgingCriteria: JudgingCriterion[];
  pivotLog: PivotEntry[];
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addTeamMember(member: Omit<TeamMember, 'joinedAt'>): Promise<IProject>;
  removeTeamMember(memberId: string): Promise<IProject>;
  addPivotEntry(pivot: Omit<PivotEntry, 'timestamp'>): Promise<IProject>;
  updateJudgingCriterion(criterionId: string, completed: boolean): Promise<IProject>;
}

// Static methods interface
export interface IProjectModel extends mongoose.Model<IProject> {
  findByProjectId(projectId: string): Promise<IProject | null>;
  findByTeamMember(memberId: string): Promise<IProject[]>;
}

const ProjectSchema = new Schema<IProject>({
  projectId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  projectName: { 
    type: String, 
    required: true, 
    maxlength: 200,
    trim: true 
  },
  oneLineIdea: { 
    type: String, 
    required: true, 
    maxlength: 500,
    trim: true 
  },
  teamMembers: {
    type: [TeamMemberSchema],
    required: true,
    validate: {
      validator: function(members: TeamMember[]) {
        return members.length >= 1;
      },
      message: 'At least one team member is required'
    }
  },
  deadlines: {
    hackingEnds: { type: Date, required: false },
    submissionDeadline: { type: Date, required: false },
    presentationTime: { type: Date, required: false }
  },
  judgingCriteria: {
    type: [JudgingCriterionSchema],
    default: []
  },
  pivotLog: {
    type: [PivotEntrySchema],
    default: []
  }
}, {
  timestamps: true,
  collection: 'projects'
});

// Indexes for better query performance
ProjectSchema.index({ 'teamMembers.id': 1 });
ProjectSchema.index({ createdAt: -1 });

// Pre-save middleware for validation
ProjectSchema.pre('save', function(next) {
  // Validate deadline order only if deadlines are provided
  if (this.deadlines && this.deadlines.hackingEnds && this.deadlines.submissionDeadline && this.deadlines.presentationTime) {
    if (this.deadlines.hackingEnds >= this.deadlines.submissionDeadline) {
      return next(new Error('Hacking end time must be before submission deadline'));
    }
    
    if (this.deadlines.submissionDeadline >= this.deadlines.presentationTime) {
      return next(new Error('Submission deadline must be before presentation time'));
    }
  }
  
  // Ensure unique team member IDs
  const memberIds = this.teamMembers.map(member => member.id);
  const uniqueIds = new Set(memberIds);
  if (memberIds.length !== uniqueIds.size) {
    return next(new Error('Team member IDs must be unique'));
  }
  
  // Ensure unique judging criteria IDs
  const criteriaIds = this.judgingCriteria.map(criterion => criterion.id);
  const uniqueCriteriaIds = new Set(criteriaIds);
  if (criteriaIds.length !== uniqueCriteriaIds.size) {
    return next(new Error('Judging criteria IDs must be unique'));
  }
  
  // Ensure unique pivot entry IDs
  const pivotIds = this.pivotLog.map(pivot => pivot.id);
  const uniquePivotIds = new Set(pivotIds);
  if (pivotIds.length !== uniquePivotIds.size) {
    return next(new Error('Pivot entry IDs must be unique'));
  }
  
  next();
});

// Instance methods
ProjectSchema.methods.addTeamMember = function(member: Omit<TeamMember, 'joinedAt'>) {
  const newMember: TeamMember = {
    ...member,
    joinedAt: new Date()
  };
  this.teamMembers.push(newMember);
  return this.save();
};

ProjectSchema.methods.removeTeamMember = function(memberId: string) {
  this.teamMembers = this.teamMembers.filter((member: TeamMember) => member.id !== memberId);
  return this.save();
};

ProjectSchema.methods.addPivotEntry = function(pivot: Omit<PivotEntry, 'timestamp'>) {
  const newPivot: PivotEntry = {
    ...pivot,
    timestamp: new Date()
  };
  this.pivotLog.push(newPivot);
  return this.save();
};

ProjectSchema.methods.updateJudgingCriterion = function(criterionId: string, completed: boolean) {
  const criterion = this.judgingCriteria.find((c: JudgingCriterion) => c.id === criterionId);
  if (criterion) {
    criterion.completed = completed;
    return this.save();
  }
  throw new Error('Judging criterion not found');
};

// Static methods
ProjectSchema.statics.findByProjectId = function(projectId: string) {
  return this.findOne({ projectId });
};

ProjectSchema.statics.findByTeamMember = function(memberId: string) {
  return this.find({ 'teamMembers.id': memberId });
};

export const Project = mongoose.model<IProject, IProjectModel>('Project', ProjectSchema);