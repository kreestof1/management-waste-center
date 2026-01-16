import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import RecyclingCenter from '../models/RecyclingCenter'
import ContainerType from '../models/ContainerType'
import Container from '../models/Container'
import StatusEvent from '../models/StatusEvent'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/container-tracking'

// Sample data
const containerTypes = [
  {
    label: 'Bois',
    icon: 'Carpenter',
    color: '#8B4513',
  },
  {
    label: 'Gravats',
    icon: 'Construction',
    color: '#808080',
  },
  {
    label: 'Carton',
    icon: 'Inventory',
    color: '#CD853F',
  },
  {
    label: 'DEEE',
    icon: 'DevicesOther',
    color: '#4169E1',
  },
  {
    label: 'Verre',
    icon: 'LocalBar',
    color: '#00CED1',
  },
]

const recyclingCenters = [
  {
    name: 'Déchetterie de Lyon Nord',
    address: '123 Rue de la République, 69001 Lyon',
    geo: {
      lat: 45.7640,
      lng: 4.8357,
    },
    phone: '+33 4 12 34 56 78',
    openingHours: {
      monday: '08:00-12:00, 14:00-18:00',
      tuesday: '08:00-12:00, 14:00-18:00',
      wednesday: '08:00-12:00, 14:00-18:00',
      thursday: '08:00-12:00, 14:00-18:00',
      friday: '08:00-12:00, 14:00-18:00',
      saturday: '09:00-17:00',
      sunday: 'Fermé',
    },
    active: true,
  },
  {
    name: 'Déchetterie de Villeurbanne',
    address: '456 Avenue Général de Gaulle, 69100 Villeurbanne',
    geo: {
      lat: 45.7719,
      lng: 4.8808,
    },
    phone: '+33 4 12 34 56 79',
    openingHours: {
      monday: '08:30-12:30, 14:00-18:30',
      tuesday: '08:30-12:30, 14:00-18:30',
      wednesday: '08:30-12:30, 14:00-18:30',
      thursday: '08:30-12:30, 14:00-18:30',
      friday: '08:30-12:30, 14:00-18:30',
      saturday: '09:00-18:00',
      sunday: 'Fermé',
    },
    active: true,
  },
  {
    name: 'Déchetterie de Caluire',
    address: '789 Montée de la Boucle, 69300 Caluire-et-Cuire',
    geo: {
      lat: 45.7956,
      lng: 4.8506,
    },
    phone: '+33 4 12 34 56 80',
    openingHours: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00',
      thursday: '08:00-18:00',
      friday: '08:00-18:00',
      saturday: '08:00-18:00',
      sunday: '10:00-16:00',
    },
    active: true,
  },
]

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await RecyclingCenter.deleteMany({})
    await ContainerType.deleteMany({})
    await Container.deleteMany({})
    await StatusEvent.deleteMany({})
    console.log('✅ Existing data cleared')

    // Create container types
    console.log('📦 Creating container types...')
    const createdTypes = await ContainerType.insertMany(containerTypes)
    console.log(`✅ Created ${createdTypes.length} container types`)

    // Create recycling centers
    console.log('🏢 Creating recycling centers...')
    const createdCenters = await RecyclingCenter.insertMany(recyclingCenters)
    console.log(`✅ Created ${createdCenters.length} recycling centers`)

    // Create users with different roles
    console.log('👥 Creating users...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    const users = [
      {
        email: 'admin@container-tracking.com',
        passwordHash: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        centerIds: [],
      },
      {
        email: 'manager1@container-tracking.com',
        passwordHash: hashedPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'manager',
        centerIds: [createdCenters[0]._id],
      },
      {
        email: 'manager2@container-tracking.com',
        passwordHash: hashedPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        role: 'manager',
        centerIds: [createdCenters[1]._id, createdCenters[2]._id],
      },
      {
        email: 'agent1@container-tracking.com',
        passwordHash: hashedPassword,
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: 'agent',
        centerIds: [createdCenters[0]._id],
      },
      {
        email: 'agent2@container-tracking.com',
        passwordHash: hashedPassword,
        firstName: 'Luc',
        lastName: 'Moreau',
        role: 'agent',
        centerIds: [createdCenters[1]._id],
      },
      {
        email: 'user1@example.com',
        passwordHash: hashedPassword,
        firstName: 'Jean',
        lastName: 'Petit',
        role: 'user',
        centerIds: [],
      },
      {
        email: 'user2@example.com',
        passwordHash: hashedPassword,
        firstName: 'Claire',
        lastName: 'Dubois',
        role: 'user',
        centerIds: [],
      },
    ]

    const createdUsers = await User.insertMany(users)
    console.log(`✅ Created ${createdUsers.length} users`)

    // Create containers
    console.log('🗑️  Creating containers...')
    const containers: any[] = []

    // Lyon Nord - 7 containers
    for (let i = 0; i < 7; i++) {
      const typeIndex = i % createdTypes.length
      containers.push({
        centerId: createdCenters[0]._id,
        typeId: createdTypes[typeIndex]._id,
        label: `${createdTypes[typeIndex].label}-A${i + 1}`,
        state: i % 3 === 0 ? 'full' : i % 3 === 1 ? 'empty' : 'maintenance',
        capacityLiters: 1000,
        locationHint: `Zone A - Emplacement ${i + 1}`,
        active: true,
      })
    }

    // Villeurbanne - 8 containers
    for (let i = 0; i < 8; i++) {
      const typeIndex = i % createdTypes.length
      containers.push({
        centerId: createdCenters[1]._id,
        typeId: createdTypes[typeIndex]._id,
        label: `${createdTypes[typeIndex].label}-B${i + 1}`,
        state: i % 4 === 0 ? 'full' : i % 4 === 1 ? 'empty' : i % 4 === 2 ? 'full' : 'empty',
        capacityLiters: 1000,
        locationHint: `Zone B - Emplacement ${i + 1}`,
        active: true,
      })
    }

    // Caluire - 5 containers
    for (let i = 0; i < 5; i++) {
      const typeIndex = i % createdTypes.length
      containers.push({
        centerId: createdCenters[2]._id,
        typeId: createdTypes[typeIndex]._id,
        label: `${createdTypes[typeIndex].label}-C${i + 1}`,
        state: i % 2 === 0 ? 'empty' : 'full',
        capacityLiters: 1000,
        locationHint: `Zone C - Emplacement ${i + 1}`,
        active: true,
      })
    }

    const createdContainers = await Container.insertMany(containers)
    console.log(`✅ Created ${createdContainers.length} containers`)

    // Create status events
    console.log('📝 Creating status events...')
    const statusEvents: any[] = []
    const now = new Date()

    // Generate events for the last 30 days
    for (const container of createdContainers) {
      const numEvents = Math.floor(Math.random() * 5) + 2 // 2-6 events per container
      let currentDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      let currentState: 'empty' | 'full' = 'empty'

      for (let i = 0; i < numEvents; i++) {
        // Random time between events (1-7 days)
        const daysBetween = Math.floor(Math.random() * 7) + 1
        currentDate = new Date(currentDate.getTime() + daysBetween * 24 * 60 * 60 * 1000)

        if (currentDate > now) break

        // Alternate between empty and full
        currentState = currentState === 'empty' ? 'full' : 'empty'

        // Random user (preferring agents and managers)
        const userIndex = Math.floor(Math.random() * 10) < 7 
          ? Math.floor(Math.random() * 5) // Agents and managers (70%)
          : 5 + Math.floor(Math.random() * 2) // Regular users (30%)

        // Map user role to valid source
        const user = createdUsers[userIndex]
        let source: 'user' | 'agent' | 'manager' | 'sensor' | 'import' = 'user'
        if (user.role === 'agent') source = 'agent'
        else if (user.role === 'manager' || user.role === 'superadmin') source = 'manager'

        statusEvents.push({
          containerId: container._id,
          newState: currentState,
          authorId: user._id,
          source,
          comment: currentState === 'full' 
            ? `Conteneur rempli à ${Math.floor(Math.random() * 20 + 80)}%`
            : 'Conteneur vidé',
          confidence: 0.9 + Math.random() * 0.1, // 0.9-1.0
          createdAt: currentDate,
        })
      }
    }

    const createdEvents = await StatusEvent.insertMany(statusEvents)
    console.log(`✅ Created ${createdEvents.length} status events`)

    console.log('\n✅ Seeding completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`  - ${createdTypes.length} container types`)
    console.log(`  - ${createdCenters.length} recycling centers`)
    console.log(`  - ${createdUsers.length} users (roles: superadmin, manager, agent, user)`)
    console.log(`  - ${createdContainers.length} containers`)
    console.log(`  - ${createdEvents.length} status events`)
    console.log('\n🔑 Test credentials:')
    console.log('  Email: admin@container-tracking.com | Password: password123 (superadmin)')
    console.log('  Email: manager1@container-tracking.com | Password: password123 (manager)')
    console.log('  Email: agent1@container-tracking.com | Password: password123 (agent)')
    console.log('  Email: user1@example.com | Password: password123 (user)')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()

