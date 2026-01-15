import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-management'
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    console.error('')
    console.error('💡 Solutions possibles:')
    console.error('   1. Démarrez MongoDB avec Docker: docker-compose -f docker-compose.mongodb.yml up -d')
    console.error('   2. Ou installez MongoDB localement: https://www.mongodb.com/try/download/community')
    console.error('   3. Ou utilisez le mode Docker complet: npm run dev avec Docker')
    console.error('')
    process.exit(1)
  }
}

export default connectDB
