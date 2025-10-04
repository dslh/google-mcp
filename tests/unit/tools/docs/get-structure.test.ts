import { describe, it, expect, vi } from 'vitest';
import { getStructure } from '../../../../src/tools/docs/get-structure.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockGoogleDocWithHeadings } from '../../../fixtures/docs-fixtures.js';

describe('docs/get-structure', () => {
  it('should extract document structure with headings', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(
      createGaxiosResponse(mockGoogleDocWithHeadings)
    );

    const result = await getStructure({ documentId: 'doc-456' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.documentId).toBe('doc-456');
    expect(result.data?.title).toBe('Document with Structure');
    expect(result.data?.structure?.headings).toHaveLength(1);
    expect(result.data?.structure?.headings[0]).toEqual({
      level: 1,
      text: 'Heading 1',
      index: 1,
    });
  });

  it('should handle document with no headings', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(
      createGaxiosResponse({
        documentId: 'doc-789',
        title: 'Plain Document',
        body: {
          content: [
            {
              startIndex: 1,
              endIndex: 20,
              paragraph: {
                elements: [
                  {
                    startIndex: 1,
                    endIndex: 20,
                    textRun: {
                      content: 'Just plain text\n',
                      textStyle: {},
                    },
                  },
                ],
              },
            },
          ],
        },
      })
    );

    const result = await getStructure({ documentId: 'doc-789' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.structure?.headings).toEqual([]);
  });

  it('should handle document with multiple heading levels', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(
      createGaxiosResponse({
        documentId: 'doc-multi',
        title: 'Multi-level Doc',
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
                    textRun: { content: 'Chapter 1\n', textStyle: {} },
                  },
                ],
                paragraphStyle: { namedStyleType: 'HEADING_1' },
              },
            },
            {
              startIndex: 10,
              endIndex: 25,
              paragraph: {
                elements: [
                  {
                    startIndex: 10,
                    endIndex: 25,
                    textRun: { content: 'Section 1.1\n', textStyle: {} },
                  },
                ],
                paragraphStyle: { namedStyleType: 'HEADING_2' },
              },
            },
            {
              startIndex: 25,
              endIndex: 40,
              paragraph: {
                elements: [
                  {
                    startIndex: 25,
                    endIndex: 40,
                    textRun: { content: 'Subsection 1.1.1\n', textStyle: {} },
                  },
                ],
                paragraphStyle: { namedStyleType: 'HEADING_3' },
              },
            },
          ],
        },
      })
    );

    const result = await getStructure({ documentId: 'doc-multi' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.structure?.headings).toHaveLength(3);
    expect(result.data?.structure?.headings[0].level).toBe(1);
    expect(result.data?.structure?.headings[1].level).toBe(2);
    expect(result.data?.structure?.headings[2].level).toBe(3);
  });

  it('should handle empty document', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.docs.documents.get).mockResolvedValue(
      createGaxiosResponse({
        documentId: 'doc-empty',
        title: 'Empty Doc',
        body: { content: [] },
      })
    );

    const result = await getStructure({ documentId: 'doc-empty' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.structure?.headings).toEqual([]);
  });

  it('should validate documentId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await getStructure({ documentId: 'invalid doc' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Document not found');
    (error as any).code = 404;
    vi.mocked(apis.docs.documents.get).mockRejectedValue(error);

    const result = await getStructure({ documentId: 'doc-123' }, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
