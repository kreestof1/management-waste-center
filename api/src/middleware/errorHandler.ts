import { Request, Response, NextFunction } from 'express'

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: Object.values(err.errors).map((e: any) => e.message),
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID invalide',
    })
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Erreur serveur interne',
  })
}

export default errorHandler
