import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
    email: string
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token d\'authentification manquant',
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string
        role: string
        email: string
      }

      // Optionally verify user still exists
      const user = await User.findById(decoded.userId)
      if (!user) {
        return res.status(401).json({
          message: 'Utilisateur non trouvé',
        })
      }

      req.user = decoded
      next()
    } catch (jwtError) {
      return res.status(401).json({
        message: 'Token invalide ou expiré',
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      message: 'Erreur d\'authentification',
    })
  }
}

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Non authentifié',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Accès refusé - Permissions insuffisantes',
      })
    }

    next()
  }
}
