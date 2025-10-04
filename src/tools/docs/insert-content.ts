import type { GoogleAPIs } from '../index.js';
import type { InsertContentParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateDocumentId, validateString, validateNumber } from '../../utils/validators.js';

export async function insertContent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as InsertContentParams;
    const documentId = validateDocumentId(params.documentId);
    const content = validateString(params.content, 'content');
    const index = validateNumber(params.index, 'index', 1);

    await apis.docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index,
              },
              text: content,
            },
          },
        ],
      },
    });

    return {
      success: true,
      data: {
        message: `Content inserted at index ${index}`,
        documentId,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
