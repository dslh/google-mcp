import { Readable } from 'stream';
import type { GoogleAPIs } from '../index.js';
import type { CreateFileParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateString, validateFileId } from '../../utils/validators.js';

export async function createFile(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as CreateFileParams;
    const name = validateString(params.name, 'name');
    const content = validateString(params.content, 'content');
    const mimeType = params.mimeType || 'text/plain';

    if (params.folderId) {
      validateFileId(params.folderId);
    }

    const metadata: {
      name: string;
      parents?: string[];
    } = {
      name,
    };

    if (params.folderId) {
      metadata.parents = [params.folderId];
    }

    const media = {
      mimeType,
      body: Readable.from([content]),
    };

    const response = await apis.drive.files.create({
      requestBody: metadata,
      media,
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
