import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Management Waste Center API',
      version: '1.0.0',
      description: 'API REST pour la gestion de centre de traitement des déchets',
      contact: {
        name: 'API Support',
        email: 'support@waste-management.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:80',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Wastes',
        description: 'Waste management endpoints',
      },
    ],
    components: {
      schemas: {
        Waste: {
          type: 'object',
          required: ['type', 'weight', 'collectionDate'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du déchet',
              example: '507f1f77bcf86cd799439011',
            },
            type: {
              type: 'string',
              enum: ['plastic', 'glass', 'paper', 'metal', 'organic', 'electronic', 'hazardous', 'other'],
              description: 'Type de déchet',
              example: 'plastic',
            },
            weight: {
              type: 'number',
              description: 'Poids en kilogrammes',
              minimum: 0,
              example: 25.5,
            },
            collectionDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de collecte',
              example: '2026-01-15T10:00:00Z',
            },
            status: {
              type: 'string',
              enum: ['collected', 'processing', 'processed', 'recycled'],
              description: 'Statut du traitement',
              example: 'collected',
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Description optionnelle',
              example: 'Bouteilles plastiques collectées',
            },
            location: {
              type: 'string',
              maxLength: 200,
              description: 'Localisation optionnelle',
              example: 'Zone A - Conteneur 3',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
            },
          },
        },
        WasteInput: {
          type: 'object',
          required: ['type', 'weight', 'collectionDate'],
          properties: {
            type: {
              type: 'string',
              enum: ['plastic', 'glass', 'paper', 'metal', 'organic', 'electronic', 'hazardous', 'other'],
              example: 'plastic',
            },
            weight: {
              type: 'number',
              minimum: 0,
              example: 25.5,
            },
            collectionDate: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:00:00Z',
            },
            status: {
              type: 'string',
              enum: ['collected', 'processing', 'processed', 'recycled'],
              example: 'collected',
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Bouteilles plastiques collectées',
            },
            location: {
              type: 'string',
              maxLength: 200,
              example: 'Zone A - Conteneur 3',
            },
          },
        },
        WasteStats: {
          type: 'object',
          properties: {
            totalWastes: {
              type: 'number',
              description: 'Nombre total de déchets',
              example: 1234,
            },
            totalWeight: {
              type: 'number',
              description: 'Poids total en kilogrammes',
              example: 15678.5,
            },
            wastesByType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    example: 'plastic',
                  },
                  count: {
                    type: 'number',
                    example: 523,
                  },
                  totalWeight: {
                    type: 'number',
                    example: 6543.2,
                  },
                },
              },
            },
            wastesByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    example: 'collected',
                  },
                  count: {
                    type: 'number',
                    example: 425,
                  },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erreur lors du traitement de la requête',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
