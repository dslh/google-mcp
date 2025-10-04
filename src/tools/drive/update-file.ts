import { Readable } from 'stream';
import type { GoogleAPIs } from '../index.js';
import type { UpdateFileParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateString, validateFileId } from '../../utils/validators.js';

export async function updateFile(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as UpdateFileParams;
    const fileId = validateFileId(params.fileId);
    const content = validateString(params.content, 'content');

    // Get current file metadata to preserve mimeType
    const currentFile = await apis.drive.files.get({
      fileId,
      fields: 'mimeType',
    });

    const media = {
      mimeType: currentFile.data.mimeType || 'text/plain',
      body: Readable.from([content]),
    };

    const response = await apis.drive.files.update({
      fileId,
      media,
      fields: 'id, name, mimeType, modifiedTime, webViewLink',
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}
