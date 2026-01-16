import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    email: string
    passwordHash: string
    role: 'visitor' | 'user' | 'agent' | 'manager' | 'superadmin'
    centerIds: mongoose.Types.ObjectId[]
    preferences: {
        locale?: string
    }
    createdAt: Date
    lastLoginAt?: Date
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        role: {
            type: String,
            enum: ['visitor', 'user', 'agent', 'manager', 'superadmin'],
            default: 'user',
        },
        centerIds: [{
            type: Schema.Types.ObjectId,
            ref: 'RecyclingCenter',
        }],
        preferences: {
            locale: {
                type: String,
                default: 'fr',
            },
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Note: email field already has unique: true, so no need for separate index

export default mongoose.model<IUser>('User', UserSchema)
