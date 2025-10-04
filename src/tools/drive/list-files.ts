import type { GoogleAPIs } from '../index.js';
import type { ListFilesParams, FileMetadata, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateNumber } from '../../utils/validators.js';

export async function listFiles(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as Partial<ListFilesParams>;

    const maxResults = params.maxResults
      ? validateNumber(params.maxResults, 'maxResults', 1, 100)
      : 10;

    const response = await apis.drive.files.list({
      q: params.query,
      pageSize: maxResults,
      orderBy: params.orderBy,
      pageToken: params.pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, parents)',
    });

    const files: FileMetadata[] =
      response.data.files?.map((file) => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        modifiedTime: file.modifiedTime!,
        size: file.size || undefined,
        webViewLink: file.webViewLink || undefined,
        parents: file.parents || undefined,
      })) || [];

    return {
      success: true,
      data: {
        files,
        nextPageToken: response.data.nextPageToken,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
