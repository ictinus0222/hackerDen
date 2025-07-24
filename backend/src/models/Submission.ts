import mongoose, { Schema, Document } from 'mongoose';
import type { SubmissionPackage } from '../types/index.js';

export interface ISubmission extends Document {
  projectId: string;
  githubUrl?: string;
  presentationUrl?: string;
  demoVideoUrl?: string;
  generatedPageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean;
}

const SubmissionSchema = new Schema<ISubmission>({
  projectId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  githubUrl: { 
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(url);
      },
      message: 'GitHub URL must be a valid URL'
    },
    trim: true
  },
  presentationUrl: { 
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(url);
      },
      message: 'Presentation URL must be a valid URL'
    },
    trim: true
  },
  demoVideoUrl: { 
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(url);
      },
      message: 'Demo video URL must be a valid URL'
    },
    trim: true
  },
  generatedPageUrl: { 
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(url);
      },
      message: 'Generated page URL must be a valid URL'
    },
    trim: true
  },
  isComplete: { 
    type: Boolean, 
    required: true, 
    default: false 
  }
}, {
  timestamps: true,
  collection: 'submissions'
});

// Indexes for better query performance
SubmissionSchema.index({ isComplete: 1 });
SubmissionSchema.index({ createdAt: -1 });

// Virtual for completion status based on required fields
SubmissionSchema.virtual('completionStatus').get(function() {
  const requiredFields = ['githubUrl', 'presentationUrl'];
  const completedFields = requiredFields.filter(field => this[field as keyof ISubmission]);
  return {
    completed: completedFields.length,
    total: requiredFields.length,
    percentage: Math.round((completedFields.length / requiredFields.length) * 100),
    isComplete: completedFields.length === requiredFields.length
  };
});

// Pre-save middleware to auto-update isComplete status
SubmissionSchema.pre('save', function(next) {
  // Auto-calculate completion status
  const hasGithub = !!this.githubUrl;
  const hasPresentation = !!this.presentationUrl;
  
  // Consider complete if at least GitHub and presentation URLs are provided
  this.isComplete = hasGithub && hasPresentation;
  
  next();
});

// Instance methods
SubmissionSchema.methods.updateUrls = function(urls: {
  githubUrl?: string;
  presentationUrl?: string;
  demoVideoUrl?: string;
}) {
  if (urls.githubUrl !== undefined) {
    this.githubUrl = urls.githubUrl;
  }
  if (urls.presentationUrl !== undefined) {
    this.presentationUrl = urls.presentationUrl;
  }
  if (urls.demoVideoUrl !== undefined) {
    this.demoVideoUrl = urls.demoVideoUrl;
  }
  return this.save();
};

SubmissionSchema.methods.generatePublicUrl = function(baseUrl: string) {
  if (!this.generatedPageUrl) {
    this.generatedPageUrl = `${baseUrl}/submission/${this.projectId}/public`;
    return this.save();
  }
  return Promise.resolve(this);
};

SubmissionSchema.methods.getPublicData = function() {
  return {
    projectId: this.projectId,
    githubUrl: this.githubUrl,
    presentationUrl: this.presentationUrl,
    demoVideoUrl: this.demoVideoUrl,
    isComplete: this.isComplete,
    updatedAt: this.updatedAt
  };
};

// Static methods
SubmissionSchema.statics.findByProjectId = function(projectId: string) {
  return this.findOne({ projectId });
};

SubmissionSchema.statics.findCompleted = function() {
  return this.find({ isComplete: true }).sort({ updatedAt: -1 });
};

SubmissionSchema.statics.findIncomplete = function() {
  return this.find({ isComplete: false }).sort({ updatedAt: -1 });
};

SubmissionSchema.statics.createOrUpdate = async function(
  projectId: string, 
  submissionData: Partial<SubmissionPackage>
) {
  const existing = await this.findOne({ projectId });
  
  if (existing) {
    Object.assign(existing, submissionData);
    return existing.save();
  } else {
    return this.create({
      projectId,
      ...submissionData
    });
  }
};

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);