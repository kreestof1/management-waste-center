import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import jwt from 'jsonwebtoken'
import connectDB from './config/database'
import { swaggerSpec } from './config/swagger'
import authRoutes from './routes/auth.routes'
import centerRoutes from './routes/center.routes'
import containerTypeRoutes from './routes/containerType.routes'
import containerRoutes from './routes/container.routes'
import dashboardRoutes from './routes/dashboard.routes'
import errorHandler from './middleware/errorHandler'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
connectDB()

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token

    if (!token) {
        return next(new Error('Authentication error: Token missing'))
    }

    try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as any
        socket.data.userId = decoded.userId
        socket.data.role = decoded.role
        next()
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'))
    }
})

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`✅ WebSocket client connected: ${socket.id} (User: ${socket.data.userId})`)

    // Join center room
    socket.on('join:center', (centerId: string) => {
        socket.join(`center:${centerId}`)
        console.log(`User ${socket.data.userId} joined center ${centerId}`)
    })

    // Leave center room
    socket.on('leave:center', (centerId: string) => {
        socket.leave(`center:${centerId}`)
        console.log(`User ${socket.data.userId} left center ${centerId}`)
    })

    socket.on('disconnect', () => {
        console.log(`❌ WebSocket client disconnected: ${socket.id}`)
    })
})

// Make io available to controllers
app.set('io', io)

console.log('✅ Socket.IO initialized')

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Container Tracking API Documentation',
}))

// Routes
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     description: Vérifie que l'API fonctionne correctement
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: API is running
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Container Tracking API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/centers', centerRoutes)
app.use('/api/container-types', containerTypeRoutes)
app.use('/api/containers', containerRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Error handling
app.use(errorHandler)

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
})

export default app
export { io }
