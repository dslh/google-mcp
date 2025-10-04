import type { GoogleAPIs } from '../index.js';
import type { GetStructureParams, DocumentStructure, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateDocumentId } from '../../utils/validators.js';
import type { docs_v1 } from 'googleapis';

export async function getStructure(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as GetStructureParams;
    const documentId = validateDocumentId(params.documentId);

    const response = await apis.docs.documents.get({
      documentId,
    });

    const doc = response.data;
    const structure = extractStructure(doc);

    return {
      success: true,
      data: {
        documentId: doc.documentId,
        title: doc.title,
        structure,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

function extractStructure(doc: docs_v1.Schema$Document): DocumentStructure {
  const headings: DocumentStructure['headings'] = [];

  if (!doc.body?.content) {
    return { headings };
  }

  for (const element of doc.body.content) {
    if (element.paragraph) {
      const styleType = element.paragraph.paragraphStyle?.namedStyleType;
      const startIndex = element.startIndex || 0;

      if (styleType?.startsWith('HEADING_')) {
        const level = parseInt(styleType.replace('HEADING_', ''));
        const text = extractParagraphText(element.paragraph);

        if (text) {
          headings.push({
            level,
            text,
            index: startIndex,
          });
        }
      }
    }
  }

  return { headings };
}

function extractParagraphText(paragraph: docs_v1.Schema$Paragraph): string {
  if (!paragraph.elements) {
    return '';
  }

  let text = '';

  for (const element of paragraph.elements) {
    if (element.textRun?.content) {
      text += element.textRun.content;
    }
  }

  return text.trim();
}
