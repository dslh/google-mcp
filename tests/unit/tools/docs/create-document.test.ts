import { describe, it, expect, vi } from 'vitest';
import { createDocument } from '../../../../src/tools/docs/create-document.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('docs/create-document', () => {
  it('should create document with title only', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.create).mockResolvedValue(
      createGaxiosResponse({
        documentId: 'doc-123',
        title: 'New Document',
      })
    );

    const result = await createDocument({ title: 'New Document' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.documentId).toBe('doc-123');
    expect(result.data?.title).toBe('New Document');
    expect(result.data?.documentUrl).toContain('doc-123');
    expect(apis.docs.documents.create).toHaveBeenCalledWith({
      requestBody: {
        title: 'New Document',
      },
    });
  });

  it('should create document with title and content', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.create).mockResolvedValue(
      createGaxiosResponse({
        documentId: 'doc-456',
        title: 'Document with Content',
      })
    );
    vi.mocked(apis.docs.documents.batchUpdate).mockResolvedValue(
      createGaxiosResponse({})
    );

    const result = await createDocument(
      {
        title: 'Document with Content',
        content: 'Initial content here',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(apis.docs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: 'doc-456',
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: 'Initial content here',
            },
          },
        ],
      },
    });
  });

  it('should validate title is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createDocument({ title: '' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('title');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Permission denied');
    (error as any).code = 403;
    vi.mocked(apis.docs.documents.create).mockRejectedValue(error);

    const result = await createDocument({ title: 'Test' }, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
