import mongoose, { Document, Schema } from 'mongoose'

export interface IRecyclingCenter extends Document {
  name: string
  address: string
  description?: string
  geo: {
    lat: number
    lng: number
  }
  publicVisibility: boolean
  openingHours?: Array<{
    day: string
    open: string
    close: string
  }>
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const RecyclingCenterSchema = new Schema<IRecyclingCenter>(
  {
    name: {
      type: String,
      required: [true, 'Center name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    geo: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
    publicVisibility: {
      type: Boolean,
      default: true,
    },
    openingHours: [{
      day: {
        type: String,
        enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      },
      open: String,
      close: String,
    }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for geospatial queries
RecyclingCenterSchema.index({ 'geo.lat': 1, 'geo.lng': 1 })
RecyclingCenterSchema.index({ active: 1, publicVisibility: 1 })

export default mongoose.model<IRecyclingCenter>('RecyclingCenter', RecyclingCenterSchema)
