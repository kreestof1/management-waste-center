import mongoose, { Document, Schema } from 'mongoose'

export interface IStatusEvent extends Document {
  containerId: mongoose.Types.ObjectId
  newState: 'empty' | 'full'
  authorId?: mongoose.Types.ObjectId
  source: 'user' | 'agent' | 'manager' | 'sensor' | 'import'
  comment?: string
  evidence?: {
    photoUrl?: string
  }
  confidence: number
  createdAt: Date
}

const StatusEventSchema = new Schema<IStatusEvent>(
  {
    containerId: {
      type: Schema.Types.ObjectId,
      ref: 'Container',
      required: [true, 'Container ID is required'],
    },
    newState: {
      type: String,
      enum: ['empty', 'full'],
      required: [true, 'New state is required'],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Nullable for sensor or import sources
    },
    source: {
      type: String,
      enum: ['user', 'agent', 'manager', 'sensor', 'import'],
      required: [true, 'Source is required'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    evidence: {
      photoUrl: String,
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Indexes for efficient queries
StatusEventSchema.index({ containerId: 1, createdAt: -1 })
StatusEventSchema.index({ authorId: 1, createdAt: -1 })
StatusEventSchema.index({ createdAt: -1 })

export default mongoose.model<IStatusEvent>('StatusEvent', StatusEventSchema)
