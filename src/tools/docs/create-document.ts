import type { GoogleAPIs } from '../index.js';
import type { CreateDocumentParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateString } from '../../utils/validators.js';

export async function createDocument(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as CreateDocumentParams;
    const title = validateString(params.title, 'title');

    // Create the document
    const response = await apis.docs.documents.create({
      requestBody: {
        title,
      },
    });

    const documentId = response.data.documentId!;

    // If content is provided, insert it
    if (params.content) {
      await apis.docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1, // After the title
                },
                text: params.content,
              },
            },
          ],
        },
      });
    }

    return {
      success: true,
      data: {
        documentId,
        title: response.data.title,
        documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
