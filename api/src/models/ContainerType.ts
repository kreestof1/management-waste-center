import mongoose, { Document, Schema } from 'mongoose'

export interface IContainerType extends Document {
  label: string
  icon?: string
  color?: string
  createdAt: Date
}

const ContainerTypeSchema = new Schema<IContainerType>(
  {
    label: {
      type: String,
      required: [true, 'Container type label is required'],
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export default mongoose.model<IContainerType>('ContainerType', ContainerTypeSchema)
