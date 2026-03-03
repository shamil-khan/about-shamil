// --- FILE: apps/api/src/api/DocumentSwaggerApi.ts ---

import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

/**
 * Handles the generation and serving of API documentation.
 * Provides Swagger UI interface and OpenAPI 3.0 specification.
 */
export class DocumentSwaggerApi {
  /** Hono router instance */
  public readonly router: Hono;

  /** Base path where this API is mounted */
  private readonly basePath: string;

  /**
   * Constructs a new DocumentSwaggerApi instance.
   * @param basePath - The base path where this router will be mounted
   */
  constructor(basePath: string = '/api/swagger') {
    this.router = new Hono();
    this.basePath = basePath;
    this.registerRoutes();
  }

  private registerRoutes = (): void => {
    /**
     * Swagger UI Endpoint.
     * Serves interactive API documentation interface.
     */
    this.router.get('/', swaggerUI({ url: `${this.basePath}/openapi.json` }));

    /**
     * OpenAPI 3.0 Schema Definition.
     * Returns the complete API specification as JSON.
     */
    this.router.get('/openapi.json', (c) => {
      return c.json(this.getOpenApiSpec());
    });
  };

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
          'API for managing user documents stored in Redis. ' +
          'All documents require userId, profileName, and languageCode as identity fields. ' +
          'Supports CRUD operations, batch operations, and user-level document management.',
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
          name: 'Document Metadata',
          description: 'Document metadata operations',
        },
        {
          name: 'User Documents',
          description: 'User-specific document operations',
        },
        {
          name: 'Batch Operations',
          description: 'Bulk document and user operations',
        },
        { name: 'System', description: 'System administration operations' },
      ],
      components: {
        schemas: {
          Document: {
            type: 'object',
            required: [
              'id',
              'userId',
              'languageCode',
              'profileName',
              'content',
              'createdOn',
            ],
            properties: {
              id: {
                type: 'string',
                description:
                  'Unique document identifier (auto-generated on creation)',
                example: 'doc_abc123xyz',
              },
              userId: {
                type: 'string',
                description: 'Owner user identifier',
                example: 'user_456def',
              },
              languageCode: {
                type: 'string',
                description: 'ISO language code (e.g., en, es, fr)',
                example: 'en',
              },
              profileName: {
                type: 'string',
                description: 'Profile name for the document',
                example: 'Professional Resume',
              },
              content: {
                type: 'string',
                description: 'Document content',
                example: 'This is the main content of the document...',
              },
              createdOn: {
                type: 'string',
                format: 'date-time',
                description:
                  'ISO timestamp when document was created (auto-generated)',
                example: '2024-01-15T10:30:00.000Z',
              },
              updatedOn: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description:
                  'ISO timestamp when document was last updated (auto-generated)',
                example: '2024-01-16T14:45:00.000Z',
              },
            },
          },
          DocumentMetadata: {
            type: 'object',
            required: ['id', 'userId', 'profileName', 'languageCode'],
            properties: {
              id: {
                type: 'string',
                description: 'Unique document identifier',
                example: 'doc_abc123xyz',
              },
              userId: {
                type: 'string',
                description: 'Owner user identifier',
                example: 'user_456def',
              },
              profileName: {
                type: 'string',
                description: 'Profile name for the document',
                example: 'Professional Resume',
              },
              languageCode: {
                type: 'string',
                description: 'ISO language code',
                example: 'en',
              },
            },
          },
          DocumentRequest: {
            type: 'object',
            required: ['userId', 'profileName', 'languageCode', 'content'],
            properties: {
              userId: {
                type: 'string',
                description: 'Owner user identifier',
                example: 'user_456def',
              },
              profileName: {
                type: 'string',
                description: 'Profile name for the document',
                example: 'Professional Resume',
              },
              languageCode: {
                type: 'string',
                description: 'ISO language code (e.g., en, es, fr)',
                example: 'en',
              },
              content: {
                type: 'string',
                description: 'Document content',
                example: 'This is the main content of the document...',
              },
            },
          },
          DocumentResponse: {
            type: 'object',
            required: ['documentId', 'timestamp', 'status', 'message'],
            properties: {
              documentId: {
                type: 'string',
                description:
                  'The document ID. For creation: auto-generated ID. For update/delete: affected document ID.',
                example: 'doc_abc123xyz',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description:
                  'Operation timestamp. For creation: createdOn. For update: updatedOn. For delete: deletion time.',
                example: '2024-01-15T10:30:00.000Z',
              },
              status: {
                type: 'boolean',
                description:
                  'Operation success status. True if succeeded, false if failed.',
                example: true,
              },
              message: {
                type: 'string',
                description:
                  'Detailed operation message. Contains document metadata on success or error details on failure.',
                example: 'Document created successfully with ID: doc_abc123xyz',
              },
            },
          },
          DocumentStoreResetResponse: {
            type: 'object',
            required: ['status', 'message'],
            properties: {
              status: {
                type: 'boolean',
                description:
                  'Reset operation status. True if succeeded, false if failed.',
                example: true,
              },
              message: {
                type: 'string',
                description:
                  'Detailed reset message. Contains deleted metadata on success or error details on failure.',
                example:
                  'Store reset successfully. Deleted 150 documents for 25 users.',
              },
            },
          },
          BatchIdsRequest: {
            type: 'object',
            required: ['ids'],
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of IDs to process',
                example: ['doc_001', 'doc_002', 'doc_003'],
              },
            },
          },
          UserIdsArray: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of user IDs',
            example: ['user_001', 'user_002', 'user_003'],
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message',
                example: 'Document not found',
              },
            },
          },
          ValidationErrorResponse: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Validation error message',
                example:
                  'Missing required identity fields: userId, profileName, and languageCode.',
              },
            },
          },
        },
      },
      paths: {
        '': {
          get: {
            tags: ['Documents'],
            summary: 'List all documents metadata',
            description:
              'Retrieves metadata for all documents in the system. ' +
              'Returns lightweight metadata (excludes content) to prevent loading large content fields into memory.',
            operationId: 'listAllDocuments',
            responses: {
              '200': {
                description: 'List of all document metadata',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentMetadata' },
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Documents'],
            summary: 'Create a new document',
            description:
              'Adds a new document to the system. ' +
              'Requires userId, profileName, languageCode, and content fields. ' +
              'The id, createdOn, and updatedOn fields are auto-generated.',
            operationId: 'createDocument',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DocumentRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'Document created successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
                  },
                },
              },
              '400': {
                description: 'Missing required identity fields',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ValidationErrorResponse',
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
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
              'Retrieves a specific document by its unique identifier, including the full content.',
            operationId: 'getDocument',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Unique document identifier',
                example: 'doc_abc123xyz',
              },
            ],
            responses: {
              '200': {
                description: 'Document found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
              '404': {
                description: 'Document not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Documents'],
            summary: 'Update document',
            description:
              'Updates an existing document. All identity fields (userId, profileName, languageCode) are required. ' +
              'The updatedOn timestamp is auto-generated.',
            operationId: 'updateDocument',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Unique document identifier',
                example: 'doc_abc123xyz',
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DocumentRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Document updated successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
                  },
                },
              },
              '400': {
                description: 'Missing required identity fields',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ValidationErrorResponse',
                    },
                  },
                },
              },
              '404': {
                description: 'Document not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['Documents'],
            summary: 'Delete document',
            description:
              'Deletes a specific document by its unique identifier.',
            operationId: 'deleteDocument',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Unique document identifier',
                example: 'doc_abc123xyz',
              },
            ],
            responses: {
              '200': {
                description: 'Document deleted successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
                  },
                },
              },
              '404': {
                description: 'Document not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/{id}/metadata': {
          get: {
            tags: ['Document Metadata'],
            summary: 'Get document metadata by ID',
            description:
              'Retrieves metadata for a specific document (excludes content). ' +
              'Useful for listing and indexing without loading large content fields.',
            operationId: 'getDocumentMetadata',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Unique document identifier',
                example: 'doc_abc123xyz',
              },
            ],
            responses: {
              '200': {
                description: 'Document metadata found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentMetadata' },
                  },
                },
              },
              '404': {
                description: 'Document not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/batch-documents': {
          delete: {
            tags: ['Batch Operations'],
            summary: 'Delete multiple documents',
            description:
              'Deletes multiple documents by providing an array of document IDs. ' +
              'Returns an array of DocumentResponse for each deletion operation.',
            operationId: 'deleteDocumentsBatch',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BatchIdsRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Documents deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentResponse' },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid or missing IDs array',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ValidationErrorResponse',
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/user/{userId}': {
          get: {
            tags: ['User Documents'],
            summary: 'Get all documents for a user',
            description:
              'Retrieves all documents (including full content) belonging to a specific user.',
            operationId: 'getUserDocuments',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User identifier',
                example: 'user_456def',
              },
            ],
            responses: {
              '200': {
                description: 'List of user documents',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Document' },
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['User Documents'],
            summary: 'Delete user and all documents',
            description:
              'Deletes a user and all their associated documents. ' +
              'Returns an array of DocumentResponse for each deleted document.',
            operationId: 'deleteUser',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User identifier',
                example: 'user_456def',
              },
            ],
            responses: {
              '200': {
                description: 'User and all documents deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentResponse' },
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/user/{userId}/metadata': {
          get: {
            tags: ['User Documents'],
            summary: 'Get document metadata for a user',
            description:
              'Retrieves lightweight metadata for all documents belonging to a user (excludes content). ' +
              'Useful for listing user documents without loading large content fields into memory.',
            operationId: 'getUserDocumentsMetadata',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User identifier',
                example: 'user_456def',
              },
            ],
            responses: {
              '200': {
                description: 'List of user document metadata',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentMetadata' },
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/batch-users': {
          delete: {
            tags: ['Batch Operations'],
            summary: 'Delete multiple users',
            description:
              'Deletes multiple users and all their associated documents by providing an array of user IDs. ' +
              'Returns an array of DocumentResponse for each deleted document.',
            operationId: 'deleteUsersBatch',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BatchIdsRequest' },
                },
              },
            },
            responses: {
              '200': {
                description:
                  'Users and all their documents deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentResponse' },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid or missing IDs array',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ValidationErrorResponse',
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/users': {
          get: {
            tags: ['User Documents'],
            summary: 'List all users',
            description:
              'Retrieves a list of all user IDs that have documents in the system.',
            operationId: 'listAllUsers',
            responses: {
              '200': {
                description: 'List of all user IDs',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserIdsArray' },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                  },
                },
              },
            },
          },
        },
        '/reset-store': {
          delete: {
            tags: ['System'],
            summary: 'Reset the document store',
            description:
              'Permanently deletes all documents, metadata, users, and indexes from the system. ' +
              'USE WITH CAUTION: This operation cannot be undone.',
            operationId: 'resetStore',
            responses: {
              '200': {
                description: 'Store reset successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/DocumentStoreResetResponse',
                    },
                  },
                },
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' },
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
  format?: string;
  nullable?: boolean;
}

interface PropertyObject {
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  items?: PropertyObject | RefObject;
  $ref?: string;
  nullable?: boolean;
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
