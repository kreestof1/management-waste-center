import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Waste from '../models/Waste'

dotenv.config()

const sampleWastes = [
    {
        type: 'plastic',
        weight: 25.5,
        collectionDate: new Date('2026-01-10T08:30:00Z'),
        status: 'collected',
        description: 'Bouteilles plastiques PET collectées',
        location: 'Zone A - Conteneur 3',
    },
    {
        type: 'glass',
        weight: 45.2,
        collectionDate: new Date('2026-01-12T10:15:00Z'),
        status: 'processing',
        description: 'Bouteilles en verre mixtes',
        location: 'Zone B - Conteneur 1',
    },
    {
        type: 'paper',
        weight: 67.8,
        collectionDate: new Date('2026-01-11T14:20:00Z'),
        status: 'processed',
        description: 'Cartons et papiers recyclables',
        location: 'Zone A - Conteneur 5',
    },
    {
        type: 'metal',
        weight: 123.4,
        collectionDate: new Date('2026-01-09T09:00:00Z'),
        status: 'recycled',
        description: 'Canettes aluminium et boîtes métalliques',
        location: 'Zone C - Conteneur 2',
    },
    {
        type: 'organic',
        weight: 89.6,
        collectionDate: new Date('2026-01-13T11:45:00Z'),
        status: 'processing',
        description: 'Déchets organiques compostables',
        location: 'Zone D - Composteur 1',
    },
    {
        type: 'electronic',
        weight: 34.2,
        collectionDate: new Date('2026-01-08T15:30:00Z'),
        status: 'collected',
        description: 'Équipements électroniques usagés',
        location: 'Zone E - Stockage sécurisé',
    },
    {
        type: 'plastic',
        weight: 18.9,
        collectionDate: new Date('2026-01-14T07:00:00Z'),
        status: 'collected',
        description: 'Emballages plastiques divers',
        location: 'Zone A - Conteneur 4',
    },
    {
        type: 'glass',
        weight: 52.1,
        collectionDate: new Date('2026-01-07T13:20:00Z'),
        status: 'recycled',
        description: 'Verre blanc trié',
        location: 'Zone B - Conteneur 2',
    },
    {
        type: 'paper',
        weight: 43.7,
        collectionDate: new Date('2026-01-15T08:45:00Z'),
        status: 'collected',
        description: 'Journaux et magazines',
        location: 'Zone A - Conteneur 6',
    },
    {
        type: 'metal',
        weight: 76.5,
        collectionDate: new Date('2026-01-06T16:00:00Z'),
        status: 'processed',
        description: 'Ferraille métallique triée',
        location: 'Zone C - Conteneur 1',
    },
    {
        type: 'hazardous',
        weight: 12.3,
        collectionDate: new Date('2026-01-05T10:30:00Z'),
        status: 'processing',
        description: 'Piles et batteries usagées',
        location: 'Zone F - Stockage dangereux',
    },
    {
        type: 'organic',
        weight: 102.8,
        collectionDate: new Date('2026-01-14T12:00:00Z'),
        status: 'processing',
        description: 'Déchets verts du jardin',
        location: 'Zone D - Composteur 2',
    },
    {
        type: 'plastic',
        weight: 31.4,
        collectionDate: new Date('2026-01-13T09:15:00Z'),
        status: 'processed',
        description: 'Films plastiques agricoles',
        location: 'Zone A - Conteneur 7',
    },
    {
        type: 'electronic',
        weight: 28.6,
        collectionDate: new Date('2026-01-12T14:50:00Z'),
        status: 'processing',
        description: 'Téléphones et tablettes obsolètes',
        location: 'Zone E - Stockage sécurisé',
    },
    {
        type: 'other',
        weight: 15.7,
        collectionDate: new Date('2026-01-11T11:20:00Z'),
        status: 'collected',
        description: 'Déchets mixtes non triés',
        location: 'Zone G - Conteneur général',
    },
    {
        type: 'glass',
        weight: 38.9,
        collectionDate: new Date('2026-01-10T15:40:00Z'),
        status: 'processing',
        description: 'Bocaux en verre',
        location: 'Zone B - Conteneur 3',
    },
    {
        type: 'paper',
        weight: 55.2,
        collectionDate: new Date('2026-01-09T08:10:00Z'),
        status: 'recycled',
        description: 'Cartons ondulés',
        location: 'Zone A - Conteneur 8',
    },
    {
        type: 'metal',
        weight: 91.3,
        collectionDate: new Date('2026-01-15T10:00:00Z'),
        status: 'collected',
        description: 'Conserves métalliques',
        location: 'Zone C - Conteneur 3',
    },
    {
        type: 'organic',
        weight: 78.4,
        collectionDate: new Date('2026-01-08T13:30:00Z'),
        status: 'recycled',
        description: 'Compost mature',
        location: 'Zone D - Composteur 3',
    },
    {
        type: 'plastic',
        weight: 22.1,
        collectionDate: new Date('2026-01-07T09:50:00Z'),
        status: 'recycled',
        description: 'Bouchons plastiques collectés',
        location: 'Zone A - Conteneur 9',
    },
]

const seedDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-management'

        console.log('🔌 Connexion à MongoDB...')
        await mongoose.connect(mongoUri)
        console.log('✅ Connecté à MongoDB')

        // Clear existing data
        console.log('🗑️  Suppression des données existantes...')
        await Waste.deleteMany({})
        console.log('✅ Données existantes supprimées')

        // Insert sample data
        console.log('📝 Insertion des données de démonstration...')
        const insertedWastes = await Waste.insertMany(sampleWastes)
        console.log(`✅ ${insertedWastes.length} déchets insérés avec succès`)

        // Display statistics
        const stats = await Waste.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalWeight: { $sum: '$weight' },
                },
            },
        ])

        console.log('\n📊 Statistiques:')
        console.log('─────────────────────────────────────')
        stats.forEach((stat) => {
            console.log(`   ${stat._id.padEnd(12)}: ${stat.count} items (${stat.totalWeight.toFixed(1)} kg)`)
        })
        console.log('─────────────────────────────────────')

        const totalWeight = stats.reduce((sum, stat) => sum + stat.totalWeight, 0)
        console.log(`   Total: ${insertedWastes.length} déchets (${totalWeight.toFixed(1)} kg)`)

        console.log('\n✨ Base de données peuplée avec succès!')
        console.log('🌐 Vous pouvez maintenant accéder à:')
        console.log('   - API: http://localhost:5000/api/wastes')
        console.log('   - Swagger: http://localhost:5000/api-docs')
        console.log('   - Frontend: http://localhost:3000/wastes')

    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error)
        process.exit(1)
    } finally {
        await mongoose.connection.close()
        console.log('\n🔌 Connexion MongoDB fermée')
    }
}

seedDatabase()
