import mongoose, { Document, Schema } from 'mongoose'

export interface IWaste extends Document {
  type: string
  weight: number
  collectionDate: Date
  status: 'collected' | 'processing' | 'processed' | 'recycled'
  description?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

const wasteSchema = new Schema<IWaste>(
  {
    type: {
      type: String,
      required: [true, 'Le type de déchet est requis'],
      enum: ['plastic', 'glass', 'paper', 'metal', 'organic', 'electronic', 'hazardous', 'other'],
    },
    weight: {
      type: Number,
      required: [true, 'Le poids est requis'],
      min: [0, 'Le poids doit être positif'],
    },
    collectionDate: {
      type: Date,
      required: [true, 'La date de collecte est requise'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['collected', 'processing', 'processed', 'recycled'],
      default: 'collected',
    },
    description: {
      type: String,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    location: {
      type: String,
      maxlength: [200, 'La localisation ne peut pas dépasser 200 caractères'],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IWaste>('Waste', wasteSchema)
