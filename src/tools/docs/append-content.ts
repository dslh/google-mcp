import type { GoogleAPIs } from '../index.js';
import type { AppendContentParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateDocumentId, validateString } from '../../utils/validators.js';

export async function appendContent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as AppendContentParams;
    const documentId = validateDocumentId(params.documentId);
    const content = validateString(params.content, 'content');

    // Get current document to find end index
    const doc = await apis.docs.documents.get({
      documentId,
    });

    const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;

    // Append content at the end
    await apis.docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: endIndex - 1, // Insert before the last character
              },
              text: '\n' + content,
            },
          },
        ],
      },
    });

    return {
      success: true,
      data: {
        message: 'Content appended successfully',
        documentId,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
