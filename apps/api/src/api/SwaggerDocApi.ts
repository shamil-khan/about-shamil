// --- FILE: apps/api/src/api/SwaggerDocApi.ts ---

import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

/**
 * Handles the generation and serving of API documentation.
 * Provides Swagger UI interface and OpenAPI 3.0 specification.
 */
export class SwaggerDocApi {
  public readonly router: Hono;

  constructor() {
    this.router = new Hono();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    /**
     * Swagger UI Endpoint.
     * Serves interactive API documentation interface.
     */
    this.router.get('/', swaggerUI({ url: '/api/swagger/openapi.json' }));

    /**
     * OpenAPI 3.0 Schema Definition.
     * Returns the complete API specification as JSON.
     */
    this.router.get('/openapi.json', (c) => {
      return c.json(this.getOpenApiSpec());
    });
  }

  /**
   * Generates the OpenAPI 3.0 specification object.
   */
  private getOpenApiSpec(): OpenApiSpec {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Document Management API',
        version: '1.0.0',
        description:
          'API for managing user documents and metadata with strict identity validation. ' +
          'All documents require userId, profileName, and languageCode fields.',
      },
      servers: [
        {
          url: '/api/docs',
          description: 'Document API base path',
        },
      ],
      tags: [
        { name: 'Documents', description: 'Document CRUD operations' },
        {
          name: 'User Documents',
          description: 'User-specific document operations',
        },
        { name: 'Batch Operations', description: 'Bulk document operations' },
      ],
      components: {
        schemas: {
          DataPayload: {
            type: 'object',
            required: [
              'id',
              'userId',
              'profileName',
              'languageCode',
              'content',
              'fileName',
              'timestamp',
            ],
            properties: {
              id: {
                type: 'string',
                description: 'Unique document identifier',
                example: 'doc-001',
              },
              userId: {
                type: 'string',
                description: 'Owner user identifier',
                example: 'user-123',
              },
              profileName: {
                type: 'string',
                description: 'Profile name',
                example: 'Default Profile',
              },
              languageCode: {
                type: 'string',
                description: 'ISO language code',
                example: 'en',
              },
              content: {
                type: 'string',
                description: 'Document content',
                example: 'Hello World',
              },
              fileName: {
                type: 'string',
                description: 'Original file name',
                example: 'document.txt',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Creation/update timestamp',
                example: '2026-03-02T01:30:00.000Z',
              },
            },
          },
          DocMeta: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Document ID',
                example: 'doc-001',
              },
              userId: {
                type: 'string',
                description: 'User identifier',
                example: 'user-123',
              },
              profileName: {
                type: 'string',
                description: 'Profile name',
                example: 'Default Profile',
              },
              languageCode: {
                type: 'string',
                description: 'Language code',
                example: 'en',
              },
            },
          },
          Success: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Document not found' },
            },
          },
          BatchDeleteRequest: {
            type: 'object',
            required: ['ids'],
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of document IDs to delete',
                example: ['doc-001', 'doc-002'],
              },
            },
          },
          DeletedIdsResponse: {
            type: 'object',
            properties: {
              deletedIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of deleted document IDs',
                example: ['doc-001', 'doc-002'],
              },
            },
          },
        },
      },
      paths: {
        '/': {
          get: {
            tags: ['Documents'],
            summary: 'List all documents',
            description: 'Retrieve metadata for all documents in the system',
            operationId: 'listDocs',
            responses: {
              '200': {
                description: 'List of document metadata',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocMeta' },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Documents'],
            summary: 'Create a new document',
            description:
              'Add a new document with required identity fields. A unique constraint exists on (userId, profileName, languageCode).',
            operationId: 'addDoc',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DataPayload' },
                },
              },
            },
            responses: {
              '201': {
                description: 'Document created successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Success' },
                  },
                },
              },
              '400': {
                description:
                  'Missing required identity fields or constraint violation',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['Batch Operations'],
            summary: 'Delete all documents',
            description:
              'Permanently removes all documents from the system. Use with caution.',
            operationId: 'deleteAll',
            responses: {
              '200': {
                description: 'All documents deleted',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Success' },
                  },
                },
              },
            },
          },
        },
        '/batch': {
          delete: {
            tags: ['Batch Operations'],
            summary: 'Delete multiple documents',
            description:
              'Delete documents by providing an array of document IDs',
            operationId: 'deleteDocs',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BatchDeleteRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Documents deleted successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Success' },
                  },
                },
              },
              '400': {
                description: 'Invalid or missing IDs array',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
            },
          },
        },
        '/user/{userId}': {
          get: {
            tags: ['User Documents'],
            summary: 'Get user documents',
            description:
              'Retrieve all full document payloads for a specific user',
            operationId: 'getUserDocs',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User identifier',
                example: 'user-123',
              },
            ],
            responses: {
              '200': {
                description: 'List of user documents',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DataPayload' },
                    },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['User Documents'],
            summary: 'Delete all user documents',
            description: 'Delete all documents belonging to a specific user',
            operationId: 'deleteUserDocs',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User identifier',
                example: 'user-123',
              },
            ],
            responses: {
              '200': {
                description: 'User documents deleted',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DeletedIdsResponse' },
                  },
                },
              },
            },
          },
        },
        '/user/{userId}/meta': {
          get: {
            tags: ['User Documents'],
            summary: 'Get user document metadata',
            description:
              'Retrieve lightweight metadata for all documents belonging to a user (excludes content)',
            operationId: 'getUserDocMeta',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User identifier',
                example: 'user-123',
              },
            ],
            responses: {
              '200': {
                description: 'List of document metadata',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocMeta' },
                    },
                  },
                },
              },
            },
          },
        },
        '/{id}': {
          get: {
            tags: ['Documents'],
            summary: 'Get document by ID',
            description:
              'Retrieve a specific document by its unique identifier',
            operationId: 'getDoc',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Document ID',
                example: 'doc-001',
              },
            ],
            responses: {
              '200': {
                description: 'Document found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DataPayload' },
                  },
                },
              },
              '404': {
                description: 'Document not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Documents'],
            summary: 'Update document',
            description:
              'Update an existing document. All fields are replaced with the new payload.',
            operationId: 'editDoc',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Document ID',
                example: 'doc-001',
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DataPayload' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Document updated successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Success' },
                  },
                },
              },
              '400': {
                description: 'Missing required fields or constraint violation',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
              '404': {
                description: 'Document not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['Documents'],
            summary: 'Delete document',
            description: 'Delete a specific document by ID',
            operationId: 'deleteDoc',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Document ID',
                example: 'doc-001',
              },
            ],
            responses: {
              '200': {
                description: 'Document deleted successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Success' },
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}

// =============================================================================
// OpenAPI Type Definitions (for internal type safety)
// =============================================================================

interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  components: {
    schemas: Record<string, SchemaObject>;
  };
  paths: Record<string, PathItemObject>;
}

interface SchemaObject {
  type: string;
  required?: string[];
  properties?: Record<string, PropertyObject>;
  items?: PropertyObject | RefObject;
  example?: unknown;
  description?: string;
}

interface PropertyObject {
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  items?: PropertyObject | RefObject;
  $ref?: string;
}

interface RefObject {
  $ref: string;
}

interface PathItemObject {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  delete?: OperationObject;
}

interface OperationObject {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Record<string, ResponseObject>;
}

interface ParameterObject {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  schema: { type: string };
  description: string;
  example?: string;
}

interface RequestBodyObject {
  required: boolean;
  content: {
    'application/json': {
      schema: RefObject;
    };
  };
}

interface ResponseObject {
  description: string;
  content?: {
    'application/json': {
      schema: RefObject | SchemaObject;
    };
  };
}
