import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

type OpenApiSpec = Record<string, unknown>;

export class DocumentSwaggerApi {
  public readonly router: Hono;
  private readonly basePath: string;

  constructor(basePath: string = '/api/swagger') {
    this.router = new Hono();
    this.basePath = basePath;
    this.registerRoutes();
  }

  private registerRoutes = (): void => {
    this.router.get('/', swaggerUI({ url: `${this.basePath}/openapi.json` }));
    this.router.get('/openapi.json', (c) => c.json(this.getOpenApiSpec()));
  };

  private getOpenApiSpec(): OpenApiSpec {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Document Management API',
        version: '1.0.0',
        description:
          'API for managing user documents stored in Redis. ' +
          'All documents require userId, profileName, and languageCode as identity fields. ' +
          'Supports inline, chunked, and external content storage strategies. ' +
          'Role-based access: USER_ADMIN for own resources, SYSTEM_ADMIN for all.',
      },
      servers: [
        {
          url: '/api/docs',
          description: 'Document API base path',
        },
      ],
      tags: [
        { name: 'Default', description: 'Default document lookup (public)' },
        { name: 'Metadata', description: 'Document metadata CRUD' },
        { name: 'Documents', description: 'Full document CRUD with content' },
        {
          name: 'Users',
          description: 'User-level operations — SYSTEM_ADMIN only',
        },
        { name: 'Batch', description: 'Bulk operations — SYSTEM_ADMIN only' },
        {
          name: 'System',
          description: 'Store-level administration — SYSTEM_ADMIN only',
        },
      ],

      // ── Reusable Components ──────────────────────────────────────
      components: {
        schemas: {
          // ── Content Variants ──────────────────────────────────────
          InlineContent: {
            type: 'object',
            required: [
              'type',
              'data',
              'mimeType',
              'fileName',
              'size',
              'encoding',
            ],
            properties: {
              type: { type: 'string', enum: ['inline'], example: 'inline' },
              data: {
                type: 'string',
                description: 'Raw or Base64-encoded content data',
                example: 'SGVsbG8gV29ybGQh',
              },
              mimeType: { type: 'string', example: 'text/plain' },
              fileName: { type: 'string', example: 'hello.txt' },
              size: {
                type: 'number',
                description: 'Size in bytes',
                example: 12,
              },
              encoding: {
                type: 'string',
                enum: ['utf-8', 'base64', 'binary'],
                example: 'base64',
              },
            },
          },

          ChunkedContent: {
            type: 'object',
            required: [
              'type',
              'totalChunks',
              'chunkSize',
              'totalSize',
              'mimeType',
              'fileName',
              'checksum',
              'chunkKeys',
            ],
            properties: {
              type: { type: 'string', enum: ['chunked'], example: 'chunked' },
              totalChunks: { type: 'number', example: 4 },
              chunkSize: { type: 'number', example: 262144 },
              totalSize: { type: 'number', example: 1048576 },
              mimeType: { type: 'string', example: 'application/pdf' },
              fileName: { type: 'string', example: 'report.pdf' },
              checksum: { type: 'string', example: 'sha256:abc123...' },
              chunkKeys: {
                type: 'array',
                items: { type: 'string' },
                example: ['chunk:0', 'chunk:1', 'chunk:2', 'chunk:3'],
              },
            },
          },

          ExternalContent: {
            type: 'object',
            required: [
              'type',
              'provider',
              'bucket',
              'key',
              'mimeType',
              'fileName',
              'size',
              'checksum',
            ],
            properties: {
              type: { type: 'string', enum: ['external'], example: 'external' },
              provider: {
                type: 'string',
                enum: ['r2', 's3', 'gcs'],
                example: 'r2',
              },
              bucket: { type: 'string', example: 'documents-prod' },
              key: { type: 'string', example: 'users/u1/docs/abc123.pdf' },
              mimeType: { type: 'string', example: 'application/pdf' },
              fileName: { type: 'string', example: 'report.pdf' },
              size: { type: 'number', example: 2097152 },
              checksum: { type: 'string', example: 'sha256:def456...' },
            },
          },

          DocumentContent: {
            oneOf: [
              { $ref: '#/components/schemas/InlineContent' },
              { $ref: '#/components/schemas/ChunkedContent' },
              { $ref: '#/components/schemas/ExternalContent' },
            ],
            discriminator: {
              propertyName: 'type',
              mapping: {
                inline: '#/components/schemas/InlineContent',
                chunked: '#/components/schemas/ChunkedContent',
                external: '#/components/schemas/ExternalContent',
              },
            },
          },

          // ── Domain Models ─────────────────────────────────────────
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
              id: { type: 'string', format: 'uuid', example: 'doc-abc-123' },
              userId: { type: 'string', example: 'user-001' },
              languageCode: { type: 'string', example: 'en' },
              profileName: { type: 'string', example: 'default' },
              content: { $ref: '#/components/schemas/DocumentContent' },
              createdOn: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-15T10:30:00Z',
              },
              updatedOn: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                example: '2025-01-16T08:00:00Z',
              },
            },
          },

          ContentMetadata: {
            type: 'object',
            required: ['mimeType', 'fileName', 'size', 'storageType'],
            properties: {
              mimeType: { type: 'string', example: 'text/plain' },
              fileName: { type: 'string', example: 'hello.txt' },
              size: { type: 'number', example: 12 },
              storageType: {
                type: 'string',
                enum: ['inline', 'chunked', 'external'],
                example: 'inline',
              },
            },
          },

          DocumentMetadata: {
            type: 'object',
            required: [
              'id',
              'userId',
              'profileName',
              'languageCode',
              'contentInfo',
            ],
            properties: {
              id: { type: 'string', format: 'uuid', example: 'doc-abc-123' },
              userId: { type: 'string', example: 'user-001' },
              profileName: { type: 'string', example: 'default' },
              languageCode: { type: 'string', example: 'en' },
              contentInfo: { $ref: '#/components/schemas/ContentMetadata' },
            },
          },

          // ── Request / Response DTOs ───────────────────────────────
          ContentPayload: {
            type: 'object',
            required: ['data', 'mimeType', 'fileName', 'encoding'],
            properties: {
              data: {
                type: 'string',
                description: 'Content data (Base64 for binary)',
                example: 'SGVsbG8gV29ybGQh',
              },
              mimeType: { type: 'string', example: 'text/plain' },
              fileName: { type: 'string', example: 'hello.txt' },
              encoding: {
                type: 'string',
                enum: ['utf-8', 'base64', 'binary'],
                example: 'base64',
              },
            },
          },

          DocumentApiRequest: {
            type: 'object',
            required: ['profileName', 'languageCode', 'content'],
            properties: {
              profileName: {
                type: 'string',
                description: 'Document profile name',
                example: 'default',
              },
              languageCode: {
                type: 'string',
                description: 'ISO language code',
                example: 'en',
              },
              content: { $ref: '#/components/schemas/ContentPayload' },
            },
          },

          DocumentResponse: {
            type: 'object',
            required: ['documentId', 'timestamp', 'status', 'message'],
            properties: {
              documentId: { type: 'string', example: 'doc-abc-123' },
              timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-15T10:30:00Z',
              },
              status: { type: 'boolean', example: true },
              message: {
                type: 'string',
                example: 'Document created successfully',
              },
            },
          },

          DocumentStoreResetResponse: {
            type: 'object',
            required: ['status', 'message'],
            properties: {
              status: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Store reset completed' },
            },
          },

          BatchIdsRequest: {
            type: 'object',
            required: ['ids'],
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                description: 'Non-empty array of ID strings',
                example: ['id-1', 'id-2', 'id-3'],
              },
            },
          },

          ErrorResponse: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Document not found' },
              message: { type: 'string', example: 'Forbidden' },
              userId: { type: 'string' },
              languageCode: { type: 'string' },
            },
          },
        },

        // ── Reusable Responses ──────────────────────────────────────
        responses: {
          BadRequest: {
            description: 'Invalid or missing parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          Forbidden: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          NotFound: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },

        // ── Parameters ─────────────────────────────────────────────
        parameters: {
          UserId: {
            name: 'user-id',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'User identifier',
            example: 'user-001',
          },
          DocId: {
            name: 'doc-id',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Document identifier',
            example: 'doc-abc-123',
          },
          OptionalLanguageCode: {
            name: 'language-code',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'ISO language code. Falls back to default if omitted.',
            example: 'en',
          },
        },
      },

      // ── Paths ────────────────────────────────────────────────────
      paths: {
        // ── GET /default ────────────────────────────────────────────
        '/default': {
          get: {
            tags: ['Default'],
            summary: 'Get default document',
            description:
              'Retrieves the default-profile document for a user. ' +
              'Falls back to the default language code if the requested language is not found.',
            operationId: 'getDefaultDocument',
            parameters: [
              { $ref: '#/components/parameters/UserId' },
              { $ref: '#/components/parameters/OptionalLanguageCode' },
            ],
            responses: {
              200: {
                description: 'Default document found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
              400: { $ref: '#/components/responses/BadRequest' },
              404: { $ref: '#/components/responses/NotFound' },
            },
          },
        },

        // ── / (metadata CRUD) ───────────────────────────────────────
        '/': {
          get: {
            tags: ['Metadata'],
            summary: 'Query document metadata',
            description:
              'No params → all documents (SYSTEM_ADMIN). ' +
              "`user-id` → user's documents (own or SYSTEM_ADMIN). " +
              '`doc-id` → single document metadata.',
            operationId: 'getDocumentMetadata',
            parameters: [
              {
                name: 'user-id',
                in: 'query',
                required: false,
                schema: { type: 'string' },
                description: 'Filter by user ID',
              },
              {
                name: 'doc-id',
                in: 'query',
                required: false,
                schema: { type: 'string' },
                description: 'Get single document metadata by ID',
              },
            ],
            responses: {
              200: {
                description: 'Metadata result(s)',
                content: {
                  'application/json': {
                    schema: {
                      oneOf: [
                        {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/DocumentMetadata',
                          },
                        },
                        { $ref: '#/components/schemas/DocumentMetadata' },
                      ],
                    },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
              404: { $ref: '#/components/responses/NotFound' },
            },
          },

          post: {
            tags: ['Metadata'],
            summary: 'Create a new document',
            description:
              'Creates a document under the authenticated user with the specified profile and language.',
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
              201: {
                description: 'Document created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
                  },
                },
              },
              400: { $ref: '#/components/responses/BadRequest' },
              403: { $ref: '#/components/responses/Forbidden' },
            },
          },

          put: {
            tags: ['Metadata'],
            summary: 'Update document content',
            description:
              'Replaces the content of an existing document. Requires ownership or SYSTEM_ADMIN.',
            operationId: 'updateDocumentContent',
            parameters: [{ $ref: '#/components/parameters/DocId' }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ContentPayload' },
                },
              },
            },
            responses: {
              200: {
                description: 'Content updated',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
              404: { $ref: '#/components/responses/NotFound' },
            },
          },

          delete: {
            tags: ['Metadata'],
            summary: 'Delete a document',
            description:
              'Deletes a single document by ID. Requires ownership or SYSTEM_ADMIN.',
            operationId: 'deleteDocument',
            parameters: [{ $ref: '#/components/parameters/DocId' }],
            responses: {
              200: {
                description: 'Document deleted',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/DocumentResponse' },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
              404: { $ref: '#/components/responses/NotFound' },
            },
          },
        },

        // ── /doc (full documents with content) ──────────────────────
        '/doc': {
          get: {
            tags: ['Documents'],
            summary: 'Get full documents with content',
            description:
              '`user-id` → all documents for user (with content). ' +
              '`doc-id` → single full document. Requires ownership or SYSTEM_ADMIN.',
            operationId: 'getFullDocuments',
            parameters: [
              {
                name: 'user-id',
                in: 'query',
                required: false,
                schema: { type: 'string' },
                description: 'Retrieve all documents for this user',
              },
              {
                name: 'doc-id',
                in: 'query',
                required: false,
                schema: { type: 'string' },
                description: 'Retrieve a single document by ID',
              },
            ],
            responses: {
              200: {
                description: 'Full document(s)',
                content: {
                  'application/json': {
                    schema: {
                      oneOf: [
                        {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Document' },
                        },
                        { $ref: '#/components/schemas/Document' },
                      ],
                    },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
              404: { $ref: '#/components/responses/NotFound' },
            },
          },
        },

        // ── /users ──────────────────────────────────────────────────
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'List all user IDs',
            description:
              'Returns all user IDs that have documents. SYSTEM_ADMIN only.',
            operationId: 'getAllUsers',
            responses: {
              200: {
                description: 'Array of user IDs',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['user-001', 'user-002'],
                    },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
            },
          },

          delete: {
            tags: ['Users'],
            summary: 'Delete all documents for a user',
            description:
              'Removes a user and all their documents. SYSTEM_ADMIN only.',
            operationId: 'deleteUser',
            parameters: [{ $ref: '#/components/parameters/UserId' }],
            responses: {
              200: {
                description: 'Deletion results for each document',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentResponse' },
                    },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
            },
          },
        },

        // ── /batch-documents ────────────────────────────────────────
        '/batch-documents': {
          delete: {
            tags: ['Batch'],
            summary: 'Batch delete documents',
            description:
              'Deletes multiple documents by ID array. SYSTEM_ADMIN only.',
            operationId: 'batchDeleteDocuments',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BatchIdsRequest' },
                },
              },
            },
            responses: {
              200: {
                description: 'Deletion results per document',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentResponse' },
                    },
                  },
                },
              },
              400: { $ref: '#/components/responses/BadRequest' },
              403: { $ref: '#/components/responses/Forbidden' },
            },
          },
        },

        // ── /batch-users ────────────────────────────────────────────
        '/batch-users': {
          delete: {
            tags: ['Batch'],
            summary: 'Batch delete users',
            description:
              'Deletes multiple users and all their documents by user-ID array. SYSTEM_ADMIN only.',
            operationId: 'batchDeleteUsers',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BatchIdsRequest' },
                },
              },
            },
            responses: {
              200: {
                description: 'Deletion results per user',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DocumentResponse' },
                    },
                  },
                },
              },
              400: { $ref: '#/components/responses/BadRequest' },
              403: { $ref: '#/components/responses/Forbidden' },
            },
          },
        },

        // ── /reset-store ────────────────────────────────────────────
        '/reset-store': {
          delete: {
            tags: ['System'],
            summary: 'Reset the entire document store',
            description:
              '⚠️ Destructive — wipes all documents and user data from the store. SYSTEM_ADMIN only.',
            operationId: 'resetStore',
            responses: {
              200: {
                description: 'Store reset result',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/DocumentStoreResetResponse',
                    },
                  },
                },
              },
              403: { $ref: '#/components/responses/Forbidden' },
            },
          },
        },
      },
    };
  }
}
