import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Container Fill-Level Tracking API',
      version: '1.0.0',
      description: 'API REST pour le suivi du taux de remplissage des conteneurs dans les déchetteries',
      contact: {
        name: 'API Support',
        email: 'support@container-tracking.com',
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
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Centers',
        description: 'Recycling center management',
      },
      {
        name: 'Container Types',
        description: 'Container type management',
      },
      {
        name: 'Containers',
        description: 'Container management and status tracking',
      },
      {
        name: 'Dashboard',
        description: 'Manager dashboard with statistics and alerts',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'passwordHash', 'firstName', 'lastName', 'role'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (unique)',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              description: 'First name',
              example: 'Jean',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
              example: 'Dupont',
            },
            role: {
              type: 'string',
              enum: ['visitor', 'user', 'agent', 'manager', 'superadmin'],
              description: 'User role',
              example: 'user',
            },
            centerIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Recycling centers associated with manager',
              example: ['507f1f77bcf86cd799439011'],
            },
            preferences: {
              type: 'object',
              properties: {
                locale: {
                  type: 'string',
                  enum: ['fr', 'en'],
                  default: 'fr',
                },
              },
            },
          },
        },
        RecyclingCenter: {
          type: 'object',
          required: ['name', 'address', 'coordinates'],
          properties: {
            _id: {
              type: 'string',
              description: 'Center ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Center name',
              example: 'Déchetterie de Lyon Nord',
            },
            address: {
              type: 'string',
              description: 'Physical address',
              example: '123 Rue de la République, 69001 Lyon',
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: 'Latitude',
                  example: 45.7640,
                },
                lng: {
                  type: 'number',
                  description: 'Longitude',
                  example: 4.8357,
                },
              },
            },
            phone: {
              type: 'string',
              example: '+33 4 12 34 56 78',
            },
            openingHours: {
              type: 'object',
              description: 'Opening hours per day',
            },
            active: {
              type: 'boolean',
              default: true,
            },
          },
        },
        ContainerType: {
          type: 'object',
          required: ['label'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            label: {
              type: 'string',
              description: 'Type label',
              example: 'Bois',
            },
            icon: {
              type: 'string',
              description: 'Material UI icon name',
              example: 'Carpenter',
            },
            color: {
              type: 'string',
              description: 'Hex color code',
              example: '#8B4513',
            },
          },
        },
        Container: {
          type: 'object',
          required: ['centerId', 'typeId', 'label', 'state'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            centerId: {
              type: 'string',
              description: 'Reference to RecyclingCenter',
              example: '507f1f77bcf86cd799439012',
            },
            typeId: {
              type: 'string',
              description: 'Reference to ContainerType',
              example: '507f1f77bcf86cd799439013',
            },
            label: {
              type: 'string',
              description: 'Container label/identifier',
              example: 'Bois-A1',
            },
            state: {
              type: 'string',
              enum: ['empty', 'full', 'maintenance'],
              description: 'Current container state',
              example: 'empty',
            },
            capacityLiters: {
              type: 'number',
              description: 'Container capacity in liters',
              example: 1000,
            },
            locationHint: {
              type: 'string',
              description: 'Location description',
              example: "Près de l'entrée principale",
            },
            active: {
              type: 'boolean',
              default: true,
            },
          },
        },
        StatusEvent: {
          type: 'object',
          required: ['containerId', 'newState', 'source'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            containerId: {
              type: 'string',
              description: 'Reference to Container',
              example: '507f1f77bcf86cd799439012',
            },
            newState: {
              type: 'string',
              enum: ['empty', 'full'],
              description: 'New container state',
              example: 'full',
            },
            authorId: {
              type: 'string',
              description: 'User who declared status',
              example: '507f1f77bcf86cd799439013',
            },
            source: {
              type: 'string',
              enum: ['user', 'agent', 'manager', 'sensor', 'import'],
              description: 'Source of status declaration',
              example: 'user',
            },
            comment: {
              type: 'string',
              maxLength: 500,
              example: 'Container is completely full',
            },
            evidence: {
              type: 'string',
              description: 'Photo URL',
              example: 'https://storage.example.com/photos/abc123.jpg',
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence score (0-1)',
              example: 0.95,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
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
