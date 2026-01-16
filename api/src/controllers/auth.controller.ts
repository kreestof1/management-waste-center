import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { AuthRequest } from '../middleware/auth.middleware'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({
        message: 'Un utilisateur avec cet email existe déjà',
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'user', // Default to 'user' role
      centerIds: [],
      preferences: {
        locale: 'fr',
      },
    })

    await user.save()

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({
      message: 'Erreur lors de l\'inscription',
    })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis',
      })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
      })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
      {
        userId: user._id,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    )

    return res.status(200).json({
      message: 'Connexion réussie',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        centerIds: user.centerIds,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la connexion',
    })
  }
}

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token requis',
      })
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
        userId: string
        type: string
      }

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          message: 'Token invalide',
        })
      }

      // Get user
      const user = await User.findById(decoded.userId)
      if (!user) {
        return res.status(401).json({
          message: 'Utilisateur non trouvé',
        })
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      return res.status(200).json({
        accessToken,
      })
    } catch (jwtError) {
      return res.status(401).json({
        message: 'Refresh token invalide ou expiré',
      })
    }
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({
      message: 'Erreur lors du rafraîchissement du token',
    })
  }
}

// Logout (client-side token removal, optional blacklist implementation)
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // In a more advanced implementation, you could:
    // - Add token to Redis blacklist
    // - Clear session in database
    // For now, client-side removal is sufficient

    return res.status(200).json({
      message: 'Déconnexion réussie',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la déconnexion',
    })
  }
}

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Non authentifié',
      })
    }

    const user = await User.findById(req.user.userId).select('-passwordHash')

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé',
      })
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        centerIds: user.centerIds,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({
      message: 'Erreur lors de la récupération du profil',
    })
  }
}
