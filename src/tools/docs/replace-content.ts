import type { GoogleAPIs } from '../index.js';
import type { ReplaceContentParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateDocumentId, validateString } from '../../utils/validators.js';

export async function replaceContent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as ReplaceContentParams;
    const documentId = validateDocumentId(params.documentId);
    const findText = validateString(params.findText, 'findText');
    const replaceText = validateString(params.replaceText, 'replaceText');
    const matchCase = params.matchCase || false;

    const response = await apis.docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: {
                text: findText,
                matchCase,
              },
              replaceText,
            },
          },
        ],
      },
    });

    const replacementCount =
      response.data.replies?.[0]?.replaceAllText?.occurrencesChanged || 0;

    return {
      success: true,
      data: {
        message: `Replaced ${replacementCount} occurrence(s)`,
        replacementCount,
        documentId,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
