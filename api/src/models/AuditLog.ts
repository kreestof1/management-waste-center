import mongoose, { Document, Schema } from 'mongoose'

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId
  action: string
  entityType: 'container' | 'center' | 'type' | 'user'
  entityId: mongoose.Types.ObjectId
  metadata?: Record<string, any>
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Nullable for system actions
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['container', 'center', 'type', 'user'],
      required: [true, 'Entity type is required'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
    },
    metadata: {
      type: Schema.Types.Mixed,
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

// Indexes for audit queries
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })
AuditLogSchema.index({ actorId: 1, createdAt: -1 })
AuditLogSchema.index({ createdAt: -1 })

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
