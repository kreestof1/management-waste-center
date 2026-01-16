import mongoose, { Document, Schema } from 'mongoose'

export interface IContainer extends Document {
  centerId: mongoose.Types.ObjectId
  typeId: mongoose.Types.ObjectId
  label: string
  capacityLiters?: number
  state: 'empty' | 'full' | 'maintenance'
  locationHint?: string
  active: boolean
  updatedAt: Date
}

const ContainerSchema = new Schema<IContainer>(
  {
    centerId: {
      type: Schema.Types.ObjectId,
      ref: 'RecyclingCenter',
      required: [true, 'Center ID is required'],
    },
    typeId: {
      type: Schema.Types.ObjectId,
      ref: 'ContainerType',
      required: [true, 'Container type ID is required'],
    },
    label: {
      type: String,
      required: [true, 'Container label is required'],
      trim: true,
    },
    capacityLiters: {
      type: Number,
      min: 0,
    },
    state: {
      type: String,
      enum: ['empty', 'full', 'maintenance'],
      default: 'empty',
      required: true,
    },
    locationHint: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
)

// Indexes for efficient queries
ContainerSchema.index({ centerId: 1, active: 1 })
ContainerSchema.index({ state: 1, updatedAt: -1 })
ContainerSchema.index({ typeId: 1 })

export default mongoose.model<IContainer>('Container', ContainerSchema)
