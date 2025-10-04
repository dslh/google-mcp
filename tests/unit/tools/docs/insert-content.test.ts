import { describe, it, expect, vi } from 'vitest';
import { insertContent } from '../../../../src/tools/docs/insert-content.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('docs/insert-content', () => {
  it('should insert content at specified index', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.batchUpdate).mockResolvedValue(
      createGaxiosResponse({})
    );

    const result = await insertContent(
      {
        documentId: 'doc-123',
        content: 'New paragraph',
        index: 10,
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.message).toContain('inserted at index 10');
    expect(apis.docs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: 'doc-123',
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 10 },
              text: 'New paragraph',
            },
          },
        ],
      },
    });
  });

  it('should validate documentId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await insertContent(
      {
        documentId: 'invalid doc',
        content: 'test',
        index: 1,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should validate content is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await insertContent(
      {
        documentId: 'doc-123',
        content: '',
        index: 1,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('content');
  });

  it('should validate index is at least 1', async () => {
    const apis = createMockGoogleAPIs();

    const result = await insertContent(
      {
        documentId: 'doc-123',
        content: 'test',
        index: 0,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('index');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Document not found');
    (error as any).code = 404;
    vi.mocked(apis.docs.documents.batchUpdate).mockRejectedValue(error);

    const result = await insertContent(
      {
        documentId: 'doc-123',
        content: 'test',
        index: 1,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
