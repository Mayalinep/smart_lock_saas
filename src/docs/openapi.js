const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Smart Lock SaaS API',
    version: '1.0.0',
    description: 'Documentation API pour Smart Lock SaaS',
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Local' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' }
    },
    schemas: {
      Access: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          propertyId: { type: 'string' },
          userId: { type: 'string' },
          accessType: { type: 'string', enum: ['TEMPORARY','PERMANENT'] },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean' },
          code: { type: 'string', description: 'Masqué hors création' },
        }
      },
      LockEvent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          details: { type: 'string' }
        }
      },
      LockStatus: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          status: { type: 'string', enum: ['locked','unlocked','error'] },
          lastActivity: { type: 'string', format: 'date-time' },
          batteryLevel: { type: 'integer', format: 'int32' }
        }
      },
      ValidateCodeRequest: {
        type: 'object',
        required: ['code','propertyId'],
        properties: {
          code: { type: 'string', example: '123456' },
          propertyId: { type: 'string' }
        }
      },
      ValidateCodeResponse: {
        type: 'object',
        properties: {
          valid: { type: 'boolean' },
          reason: { type: 'string' },
          accessId: { type: 'string' },
          propertyId: { type: 'string' },
          userId: { type: 'string' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Non authentifié' }
        }
      },
      PagedAccessResponse: {
        type: 'object',
        properties: {
          accesses: { type: 'array', items: { $ref: '#/components/schemas/Access' } },
          nextCursor: { type: 'string', nullable: true },
          hasMore: { type: 'boolean' }
        }
      },
      CreatePropertyRequest: {
        type: 'object',
        required: ['address'],
        properties: {
          title: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          description: { type: 'string' }
        }
      },
      CreateAccessRequest: {
        type: 'object',
        required: ['propertyId','userId','startDate','endDate','accessType'],
        properties: {
          propertyId: { type: 'string' },
          userId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          accessType: { type: 'string', enum: ['TEMPORARY','PERMANENT'] },
          description: { type: 'string' }
        }
      },
      LockEventsResponse: {
        type: 'object',
        properties: {
          propertyId: { type: 'string' },
          events: { type: 'array', items: { $ref: '#/components/schemas/LockEvent' } },
          total: { type: 'integer' },
          filteredBy: { type: 'string' },
          nextCursor: { type: 'string', nullable: true },
          hasMore: { type: 'boolean' }
        }
      },
      WebhookEndpoint: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          url: { type: 'string' },
          events: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

// Définition des opérations (paths) clés
const paths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Inscription utilisateur',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email','password','firstName','lastName'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8 },
                firstName: { type: 'string' },
                lastName: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'Créé' }, '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login (dépose un cookie token)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email','password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'OK' }, '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } }
    }
  },
  '/access/validate': {
    post: {
      tags: ['Access'],
      summary: 'Valider un code d\'accès',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidateCodeRequest' } } }
      },
      responses: {
        '200': { description: 'Résultat validation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidateCodeResponse' } } } },
        '400': { description: 'Données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        '403': { description: 'Accès interdit', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/access/property/{propertyId}': {
    get: {
      tags: ['Access'],
      security: [{ cookieAuth: [] }],
      summary: 'Liste des accès d\'une propriété (cursor-based)',
      parameters: [
        { name: 'propertyId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
        { name: 'cursor', in: 'query', required: false, schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagedAccessResponse' } } } },
        '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        '403': { description: 'Accès interdit', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/access/my-accesses': {
    get: {
      tags: ['Access'],
      security: [{ cookieAuth: [] }],
      summary: 'Accès de l\'utilisateur connecté (cursor-based)',
      parameters: [
        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
        { name: 'cursor', in: 'query', required: false, schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagedAccessResponse' } } } },
        '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/lock/status/{propertyId}': {
    get: {
      tags: ['Lock'],
      security: [{ cookieAuth: [] }],
      summary: 'Statut de la serrure',
      parameters: [ { name: 'propertyId', in: 'path', required: true, schema: { type: 'string' } } ],
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/LockStatus' } } } },
        '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        '403': { description: 'Accès interdit', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/lock/events/{propertyId}': {
    get: {
      tags: ['Lock'],
      security: [{ cookieAuth: [] }],
      summary: 'Historique des événements (cursor-based)',
      parameters: [
        { name: 'propertyId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'type', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
        { name: 'cursor', in: 'query', required: false, schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/LockEventsResponse' } } } },
        '401': { description: 'Non authentifié', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        '403': { description: 'Accès interdit', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  }
};

paths['/properties'] = {
  post: {
    tags: ['Properties'],
    security: [{ cookieAuth: [] }],
    summary: 'Créer une propriété',
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePropertyRequest' } } }
    },
    responses: { '201': { description: 'Créée' } }
  }
};

paths['/access'] = {
  post: {
    tags: ['Access'],
    security: [{ cookieAuth: [] }],
    summary: 'Créer un accès',
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAccessRequest' } } }
    },
    responses: { '201': { description: 'Créé' } }
  }
};

paths['/webhooks'] = {
  get: {
    tags: ['Webhooks'],
    summary: 'Lister mes endpoints webhooks',
    security: [{ cookieAuth: [] }],
    responses: {
      '200': { description: 'OK' },
      '401': { description: 'Non authentifié' }
    }
  },
  post: {
    tags: ['Webhooks'],
    summary: 'Créer un endpoint webhook',
    security: [{ cookieAuth: [] }],
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { type: 'object', required: ['url','secret'], properties: { url: { type: 'string' }, secret: { type: 'string' }, events: { type: 'string' } } } } }
    },
    responses: {
      '201': { description: 'Créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/WebhookEndpoint' } } } },
      '400': { description: 'Données invalides' },
      '401': { description: 'Non authentifié' }
    }
  }
};

paths['/webhooks/{id}'] = {
  delete: {
    tags: ['Webhooks'],
    summary: 'Supprimer un endpoint webhook',
    security: [{ cookieAuth: [] }],
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      '200': { description: 'OK' },
      '401': { description: 'Non authentifié' }
    }
  }
};

const options = { swaggerDefinition, apis: [] };
// swagger-jsdoc est gardé pour compat, mais on surcharge paths directement
const base = swaggerJSDoc(options);
const openapiSpec = { ...base, paths };

module.exports = { openapiSpec };

