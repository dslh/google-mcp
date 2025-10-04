import type { GoogleAPIs } from '../index.js';
import type { GetFileMetadataParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateFileId } from '../../utils/validators.js';

export async function getFileMetadata(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as GetFileMetadataParams;
    const fileId = validateFileId(params.fileId);

    const response = await apis.drive.files.get({
      fileId,
      fields: '*',
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}
