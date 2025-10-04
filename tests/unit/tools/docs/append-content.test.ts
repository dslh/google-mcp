import { describe, it, expect, vi } from 'vitest';
import { appendContent } from '../../../../src/tools/docs/append-content.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('docs/append-content', () => {
  it('should append content to document', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(
      createGaxiosResponse({
        documentId: 'doc-123',
        body: {
          content: [
            { startIndex: 1, endIndex: 50 },
            { startIndex: 50, endIndex: 100 },
          ],
        },
      })
    );
    vi.mocked(apis.docs.documents.batchUpdate).mockResolvedValue(
      createGaxiosResponse({})
    );

    const result = await appendContent(
      {
        documentId: 'doc-123',
        content: 'New paragraph',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.message).toContain('appended successfully');
    expect(apis.docs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: 'doc-123',
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 99 }, // endIndex - 1
              text: '\nNew paragraph',
            },
          },
        ],
      },
    });
  });

  it('should validate documentId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await appendContent(
      {
        documentId: 'invalid doc',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should validate content is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await appendContent(
      {
        documentId: 'doc-123',
        content: '',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('content');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Document not found');
    (error as any).code = 404;
    vi.mocked(apis.docs.documents.get).mockRejectedValue(error);

    const result = await appendContent(
      {
        documentId: 'doc-123',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
