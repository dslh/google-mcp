import { describe, it, expect, vi } from 'vitest';
import { readDocument } from '../../../../src/tools/docs/read-document.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockGoogleDoc, mockGoogleDocWithHeadings } from '../../../fixtures/docs-fixtures.js';

describe('docs/read-document', () => {
  it('should read document with default text format', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(createGaxiosResponse(mockGoogleDoc));

    const result = await readDocument({ documentId: 'doc-123' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.documentId).toBe('doc-123');
    expect(result.data?.title).toBe('Test Document');
    expect(result.data?.content).toBe('Test content');
    expect(apis.docs.documents.get).toHaveBeenCalledWith({
      documentId: 'doc-123',
    });
  });

  it('should read document with markdown format', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(
      createGaxiosResponse(mockGoogleDocWithHeadings)
    );

    const result = await readDocument({ documentId: 'doc-456', format: 'markdown' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.content).toContain('# Heading 1');
    expect(result.data?.content).toContain('Some content');
  });

  it('should validate documentId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await readDocument({ documentId: 'invalid doc id' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should handle empty document', async () => {
    const apis = createMockGoogleAPIs();
    const emptyDoc = {
      documentId: 'doc-789',
      title: 'Empty Doc',
      body: { content: [] },
    };
    vi.mocked(apis.docs.documents.get).mockResolvedValue(createGaxiosResponse(emptyDoc));

    const result = await readDocument({ documentId: 'doc-789' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.content).toBe('');
  });

  it('should handle document with no body', async () => {
    const apis = createMockGoogleAPIs();
    const docNoBody = {
      documentId: 'doc-999',
      title: 'No Body',
      body: {},
    };
    vi.mocked(apis.docs.documents.get).mockResolvedValue(createGaxiosResponse(docNoBody));

    const result = await readDocument({ documentId: 'doc-999' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.content).toBe('');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Document not found');
    (error as any).code = 404;
    vi.mocked(apis.docs.documents.get).mockRejectedValue(error);

    const result = await readDocument({ documentId: 'doc-123' }, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });

  it('should extract text from paragraphs with multiple text runs', async () => {
    const apis = createMockGoogleAPIs();
    const docWithMultipleRuns = {
      documentId: 'doc-multi',
      title: 'Multi-run Doc',
      body: {
        content: [
          {
            startIndex: 1,
            endIndex: 20,
            paragraph: {
              elements: [
                {
                  startIndex: 1,
                  endIndex: 6,
                  textRun: {
                    content: 'Hello',
                    textStyle: {},
                  },
                },
                {
                  startIndex: 6,
                  endIndex: 20,
                  textRun: {
                    content: ' World',
                    textStyle: {},
                  },
                },
              ],
            },
          },
        ],
      },
    };
    vi.mocked(apis.docs.documents.get).mockResolvedValue(createGaxiosResponse(docWithMultipleRuns));

    const result = await readDocument({ documentId: 'doc-multi' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.content).toBe('Hello World');
  });

  it('should handle tables in document', async () => {
    const apis = createMockGoogleAPIs();
    const docWithTable = {
      documentId: 'doc-table',
      title: 'Table Doc',
      body: {
        content: [
          {
            startIndex: 1,
            endIndex: 10,
            paragraph: {
              elements: [
                {
                  startIndex: 1,
                  endIndex: 10,
                  textRun: {
                    content: 'Before table',
                    textStyle: {},
                  },
                },
              ],
            },
          },
          {
            startIndex: 10,
            endIndex: 20,
            table: {},
          },
        ],
      },
    };
    vi.mocked(apis.docs.documents.get).mockResolvedValue(createGaxiosResponse(docWithTable));

    const result = await readDocument({ documentId: 'doc-table' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.content).toContain('Before table');
    expect(result.data?.content).toContain('[Table content]');
  });
});
