import { describe, it, expect, vi } from 'vitest';
import { replaceContent } from '../../../../src/tools/docs/replace-content.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('docs/replace-content', () => {
  it('should replace all occurrences of text', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.batchUpdate).mockResolvedValue(
      createGaxiosResponse({
        replies: [
          {
            replaceAllText: {
              occurrencesChanged: 3,
            },
          },
        ],
      })
    );

    const result = await replaceContent(
      {
        documentId: 'doc-123',
        findText: 'old text',
        replaceText: 'new text',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.replacementCount).toBe(3);
    expect(result.data?.message).toContain('Replaced 3 occurrence(s)');
    expect(apis.docs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: 'doc-123',
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: 'old text',
                matchCase: false,
              },
              replaceText: 'new text',
            },
          },
        ],
      },
    });
  });

  it('should respect matchCase parameter', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.batchUpdate).mockResolvedValue(
      createGaxiosResponse({
        replies: [{ replaceAllText: { occurrencesChanged: 1 } }],
      })
    );

    await replaceContent(
      {
        documentId: 'doc-123',
        findText: 'Test',
        replaceText: 'test',
        matchCase: true,
      },
      apis
    );

    expect(apis.docs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: 'doc-123',
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: 'Test',
                matchCase: true,
              },
              replaceText: 'test',
            },
          },
        ],
      },
    });
  });

  it('should handle no replacements found', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.batchUpdate).mockResolvedValue(
      createGaxiosResponse({
        replies: [
          {
            replaceAllText: {
              occurrencesChanged: 0,
            },
          },
        ],
      })
    );

    const result = await replaceContent(
      {
        documentId: 'doc-123',
        findText: 'nonexistent',
        replaceText: 'replacement',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.replacementCount).toBe(0);
  });

  it('should validate documentId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await replaceContent(
      {
        documentId: 'invalid doc',
        findText: 'test',
        replaceText: 'replacement',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should validate findText is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await replaceContent(
      {
        documentId: 'doc-123',
        findText: '',
        replaceText: 'replacement',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('findText');
  });

  it('should validate replaceText is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await replaceContent(
      {
        documentId: 'doc-123',
        findText: 'test',
        replaceText: '',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('replaceText');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Document not found');
    (error as any).code = 404;
    vi.mocked(apis.docs.documents.batchUpdate).mockRejectedValue(error);

    const result = await replaceContent(
      {
        documentId: 'doc-123',
        findText: 'test',
        replaceText: 'replacement',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
