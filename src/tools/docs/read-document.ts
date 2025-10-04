import type { GoogleAPIs } from '../index.js';
import type { ReadDocumentParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateDocumentId } from '../../utils/validators.js';
import type { docs_v1 } from 'googleapis';

export async function readDocument(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as ReadDocumentParams;
    const documentId = validateDocumentId(params.documentId);
    const format = params.format || 'text';

    const response = await apis.docs.documents.get({
      documentId,
    });

    const doc = response.data;
    const content = extractText(doc, format);

    return {
      success: true,
      data: {
        documentId: doc.documentId,
        title: doc.title,
        content,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

function extractText(doc: docs_v1.Schema$Document, format: string): string {
  if (!doc.body?.content) {
    return '';
  }

  const lines: string[] = [];

  for (const element of doc.body.content) {
    if (element.paragraph) {
      const paragraphText = extractParagraphText(element.paragraph, format);
      if (paragraphText) {
        lines.push(paragraphText);
      }
    } else if (element.table) {
      lines.push('[Table content]'); // Simplified table handling
    }
  }

  return lines.join('\n');
}

function extractParagraphText(
  paragraph: docs_v1.Schema$Paragraph,
  format: string
): string {
  if (!paragraph.elements) {
    return '';
  }

  let text = '';

  for (const element of paragraph.elements) {
    if (element.textRun?.content) {
      text += element.textRun.content;
    }
  }

  // For markdown format, add heading markers
  if (format === 'markdown' && paragraph.paragraphStyle?.namedStyleType) {
    const styleType = paragraph.paragraphStyle.namedStyleType;
    if (styleType.startsWith('HEADING_')) {
      const level = parseInt(styleType.replace('HEADING_', ''));
      text = '#'.repeat(level) + ' ' + text.trim();
    }
  }

  return text.trim();
}
