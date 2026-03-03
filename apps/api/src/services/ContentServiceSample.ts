// --- FILE: apps/api/src/services/ContentService.ts ---

import {
  DocumentContent,
  InlineContent,
  ChunkedContent,
  ContentPayload,
  MAX_INLINE_CONTENT_SIZE,
  ContentEncoding,
} from '../data';
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

/** Chunk size for large content (256KB) */
const CHUNK_SIZE = 256 * 1024;

/**
 * Service for handling document content storage strategies.
 */
export class ContentServiceSample {
  constructor(private readonly redis: Redis) {}

  /**
   * Processes content payload and determines storage strategy.
   * @param documentId - The document ID for chunk key generation
   * @param payload - The content payload from request
   * @returns Processed DocumentContent with appropriate storage type
   */
  async processContent(
    documentId: string,
    payload: ContentPayload,
  ): Promise<DocumentContent> {
    const decodedSize = this.calculateDecodedSize(
      payload.data,
      payload.encoding,
    );

    if (decodedSize <= MAX_INLINE_CONTENT_SIZE) {
      return this.createInlineContent(payload, decodedSize);
    }

    return this.createChunkedContent(documentId, payload);
  }

  /**
   * Retrieves full content data from storage.
   * @param content - The document content reference
   * @returns Content data as string
   */
  async retrieveContent(content: DocumentContent): Promise<string> {
    switch (content.type) {
      case 'inline':
        return content.data;

      case 'chunked':
        return this.retrieveChunkedContent(content);

      case 'external':
        throw new Error('External content retrieval not implemented');

      default:
        throw new Error(
          `Unknown content type: ${(content as DocumentContent).type}`,
        );
    }
  }

  /**
   * Deletes content from storage.
   * @param content - The document content to delete
   */
  async deleteContent(content: DocumentContent): Promise<void> {
    if (content.type === 'chunked') {
      await this.redis.del(...content.chunkKeys);
    }
    // Inline content is deleted with the document
    // External content requires separate cleanup
  }

  /**
   * Calculates the decoded size of content.
   */
  private calculateDecodedSize(
    data: string,
    encoding: ContentEncoding,
  ): number {
    if (encoding === 'base64') {
      // Base64 encoded data is ~33% larger than original
      return Math.ceil((data.length * 3) / 4);
    }
    return new TextEncoder().encode(data).length;
  }

  /**
   * Creates inline content storage.
   */
  private createInlineContent(
    payload: ContentPayload,
    size: number,
  ): InlineContent {
    return {
      type: 'inline',
      data: payload.data,
      mimeType: payload.mimeType,
      fileName: payload.fileName,
      size,
      encoding: payload.encoding,
    };
  }

  /**
   * Creates chunked content storage.
   */
  private async createChunkedContent(
    documentId: string,
    payload: ContentPayload,
  ): Promise<ChunkedContent> {
    const data = payload.data;
    const chunks: string[] = [];
    const chunkKeys: string[] = [];

    // Split data into chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      chunks.push(data.slice(i, i + CHUNK_SIZE));
    }

    // Store chunks in Redis
    const pipeline = this.redis.pipeline();
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `doc:${documentId}:chunk:${i}`;
      chunkKeys.push(chunkKey);
      pipeline.set(chunkKey, chunks[i]);
    }
    await pipeline.exec();

    // Calculate checksum
    const checksum = createHash('sha256').update(data).digest('hex');

    return {
      type: 'chunked',
      totalChunks: chunks.length,
      chunkSize: CHUNK_SIZE,
      totalSize: this.calculateDecodedSize(data, payload.encoding),
      mimeType: payload.mimeType,
      fileName: payload.fileName,
      checksum,
      chunkKeys,
    };
  }

  /**
   * Retrieves chunked content from Redis.
   */
  private async retrieveChunkedContent(
    content: ChunkedContent,
  ): Promise<string> {
    const chunks = await this.redis.mget<string[]>(...content.chunkKeys);

    const missingChunks = chunks.filter((c) => c === null);
    if (missingChunks.length > 0) {
      throw new Error(`Missing ${missingChunks.length} content chunks`);
    }

    return chunks.join('');
  }
}
