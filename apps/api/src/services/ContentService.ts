import {
  DocumentContent,
  InlineContent,
  ContentPayload,
  ContentEncoding,
} from '../data';

/**
 * Service for handling document content transformations.
 * Responsible for converting between request payloads and storage formats.
 */
export class ContentService {
  /**
   * Converts a ContentPayload from request to DocumentContent for storage.
   * Determines storage strategy based on content size.
   *
   * @param payload - The content payload from the request
   * @returns DocumentContent with appropriate storage type
   */
  static toDocumentContent(payload: ContentPayload): DocumentContent {
    const size = ContentService.calculateContentSize(
      payload.data,
      payload.encoding,
    );

    // For now, store all content as inline
    // TODO: Implement chunked storage for large content (> MAX_INLINE_CONTENT_SIZE)

    const inlineContent: InlineContent = {
      type: 'inline',
      data: payload.data,
      mimeType: payload.mimeType,
      fileName: payload.fileName,
      size,
      encoding: payload.encoding,
    };

    return inlineContent;
  }

  /**
   * Calculates the decoded size of content in bytes.
   *
   * @param data - The content data string
   * @param encoding - The encoding used for the data
   * @returns Size in bytes
   */
  static calculateContentSize(data: string, encoding: ContentEncoding): number {
    if (encoding === 'base64') {
      // Base64 encoded data is ~33% larger than original
      // Formula: Math.ceil((base64Length * 3) / 4)
      const padding = (data.match(/=+$/) || [''])[0].length;
      return Math.ceil((data.length * 3) / 4) - padding;
    }

    // UTF-8 or binary: use TextEncoder for accurate byte count
    return new TextEncoder().encode(data).length;
  }
}
