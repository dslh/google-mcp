import type { docs_v1 } from 'googleapis';

export const mockGoogleDoc: docs_v1.Schema$Document = {
  documentId: 'doc-123',
  title: 'Test Document',
  body: {
    content: [
      {
        startIndex: 1,
        endIndex: 14,
        paragraph: {
          elements: [
            {
              startIndex: 1,
              endIndex: 14,
              textRun: {
                content: 'Test content\n',
                textStyle: {},
              },
            },
          ],
        },
      },
    ],
  },
};

export const mockGoogleDocWithHeadings: docs_v1.Schema$Document = {
  documentId: 'doc-456',
  title: 'Document with Structure',
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
                content: 'Heading 1\n',
                textStyle: {},
              },
            },
          ],
          paragraphStyle: {
            namedStyleType: 'HEADING_1',
          },
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
              textRun: {
                content: 'Some content\n',
                textStyle: {},
              },
            },
          ],
        },
      },
    ],
  },
};

export const mockBatchUpdateResponse: docs_v1.Schema$BatchUpdateDocumentResponse = {
  documentId: 'doc-123',
  replies: [
    {
      insertText: {
        insertionIndex: 1,
      },
    },
  ],
};
