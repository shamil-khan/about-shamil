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
          name: 'User Documents',
          description: 'User-specific document operations',
        },
        {
          name: 'Batch Operations',
          description: 'Bulk document and user operations - SYSTEM ADMIN ONLY',
        },
        { name: 'System', description: 'System administration operations' },
      ],
      components: {
        schemas: {
          // Add to DocumentOpenApiSpec.ts components.schemas:

          ContentPayload: {
            type: 'object',
            required: ['data', 'mimeType', 'fileName', 'encoding'],
            properties: {
              data: {
                type: 'string',
                description: 'Content data (Base64 encoded for binary files)',
                example: 'SGVsbG8gV29ybGQh',
              },
              mimeType: {
                type: 'string',
                description: 'MIME type of the content',
                example: 'text/plain',
              },
              fileName: {
                type: 'string',
                description: 'Original filename',
                example: 'document.txt',
              },
              encoding: {
                type: 'string',
                enum: ['utf-8', 'base64', 'binary'],
                description: 'Encoding of the data field',
                example: 'utf-8',
              },
            },
          },
          ContentMetadata: {
            type: 'object',
            properties: {
              mimeType: {
                type: 'string',
                description: 'MIME type',
                example: 'text/plain',
              },
              fileName: {
                type: 'string',
                description: 'Original filename',
                example: 'document.txt',
              },
              size: {
                type: 'integer',
                description: 'Size in bytes',
                example: 1024,
              },
              storageType: {
                type: 'string',
                enum: ['inline', 'chunked', 'external'],
                description: 'Storage strategy used',
                example: 'inline',
              },
            },
          },
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
          DocumentApiRequest: {
            type: 'object',
            required: ['profileName', 'languageCode', 'content'],
            properties: {
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
              'Retrieves metadata for all documents based on logged-in user role.' +
              'If logged in user has SYSTEM_ADMIN role, than returns all documents in the system.' +
              'If logged in user has USER_ADMIN role, than returns all user documents in the system.' +
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
              '403': {
                description: 'Logged-in user is can not access.',
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
                  schema: { $ref: '#/components/schemas/DocumentApiRequest' },
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
        '/identity/{userId}/{languageCode}?': {
          get: {
            tags: ['Documents'],
            summary: 'Get document by identity',
            description:
              'Retrieves a document by its identity (secondary key: profileName + languageCode). ' +
              'Useful when the document ID is unknown but identity fields are available.',
            operationId: 'getDocumentByIdentity',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'Owner user identifier',
                example: 'user_456def',
              },
              {
                name: 'languageCode',
                in: 'path',
                required: false,
                schema: { type: 'string' },
                description: 'ISO language code',
                example: 'en',
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
            summary: 'Update document content',
            description:
              'Updates the content of an existing document. ' +
              'Identity fields (userId, profileName, languageCode) remain unchanged and cannot be modified. ' +
              'To change identity fields, delete and recreate the document.',
            operationId: 'updateContent',
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
              description: 'New content payload',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ContentPayload' },
                },
              },
            },
            responses: {
              '200': {
                description: 'Content updated successfully',
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
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
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
// --- FILE: apps/api/src/api/DocumentOpenApiSpec.ts ---

// ... (keep everything above the type definitions)

// =============================================================================
// OpenAPI Type Definitions (for internal type safety)
// =============================================================================

/** OpenAPI 3.0 specification root object */
interface OpenApiSpec {
  openapi: string;
  info: OpenApiInfo;
  servers: OpenApiServer[];
  tags: OpenApiTag[];
  components: OpenApiComponents;
  paths: Record<string, PathItemObject>;
}

/** API metadata */
interface OpenApiInfo {
  title: string;
  version: string;
  description: string;
}

/** Server configuration */
interface OpenApiServer {
  url: string;
  description: string;
}

/** Tag for grouping operations */
interface OpenApiTag {
  name: string;
  description: string;
}

/** Reusable components */
interface OpenApiComponents {
  schemas: Record<string, SchemaObject>;
}

/** Schema definition */
interface SchemaObject {
  type: string;
  required?: string[];
  properties?: Record<string, PropertyObject>;
  items?: PropertyObject | RefObject;
  example?: unknown;
  description?: string;
  format?: string;
  nullable?: boolean;
  enum?: readonly string[];
}

/** Property definition */
interface PropertyObject {
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  items?: PropertyObject | RefObject;
  $ref?: string;
  nullable?: boolean;
  /** Enumerated values for this property */
  enum?: readonly string[];
  /** Minimum value for numbers */
  minimum?: number;
  /** Maximum value for numbers */
  maximum?: number;
  /** Minimum length for strings */
  minLength?: number;
  /** Maximum length for strings */
  maxLength?: number;
  /** Default value */
  default?: unknown;
  /** Pattern for string validation (regex) */
  pattern?: string;
  /** Whether the property is read-only */
  readOnly?: boolean;
  /** Whether the property is write-only */
  writeOnly?: boolean;
}

/** Reference to another schema */
interface RefObject {
  $ref: string;
}

/** Path item with HTTP methods */
interface PathItemObject {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
}

/** API operation definition */
interface OperationObject {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses: Record<string, ResponseObject>;
  /** Whether the operation is deprecated */
  deprecated?: boolean;
  /** Security requirements */
  security?: Record<string, string[]>[];
}

/** Parameter definition */
interface ParameterObject {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  schema: ParameterSchemaObject;
  description: string;
  example?: unknown;
  /** Whether the parameter is deprecated */
  deprecated?: boolean;
}

/** Schema object for parameters */
interface ParameterSchemaObject {
  type: string;
  format?: string;
  enum?: readonly string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
}

/** Request body definition */
interface RequestBodyObject {
  required: boolean;
  description?: string;
  content: {
    'application/json'?: MediaTypeObject;
    'multipart/form-data'?: MediaTypeObject;
    'application/octet-stream'?: MediaTypeObject;
  };
}

/** Media type object */
interface MediaTypeObject {
  schema: RefObject | SchemaObject;
  example?: unknown;
}

/** Response definition */
interface ResponseObject {
  description: string;
  content?: {
    'application/json'?: MediaTypeObject;
    'application/octet-stream'?: MediaTypeObject;
  };
  headers?: Record<string, HeaderObject>;
}

/** Header definition */
interface HeaderObject {
  description?: string;
  schema: ParameterSchemaObject;
}
