import type { GoogleAPIs } from '../index.js';
import type { CreateFolderParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateString, validateFileId } from '../../utils/validators.js';

export async function createFolder(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as CreateFolderParams;
    const name = validateString(params.name, 'name');

    if (params.parentFolderId) {
      validateFileId(params.parentFolderId);
    }

    const metadata: {
      name: string;
      mimeType: string;
      parents?: string[];
    } = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (params.parentFolderId) {
      metadata.parents = [params.parentFolderId];
    }

    const response = await apis.drive.files.create({
      requestBody: metadata,
      fields: 'id, name, mimeType, webViewLink',
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}
