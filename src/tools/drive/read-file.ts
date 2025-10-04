import type { GoogleAPIs } from '../index.js';
import type { ReadFileParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateFileId } from '../../utils/validators.js';

export async function readFile(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as ReadFileParams;
    const fileId = validateFileId(params.fileId);

    // First, get file metadata to determine if it's a Google Workspace file
    const metadata = await apis.drive.files.get({
      fileId,
      fields: 'mimeType, name',
    });

    const mimeType = metadata.data.mimeType;
    const isGoogleDoc = mimeType?.startsWith('application/vnd.google-apps.');

    let content: string;

    if (isGoogleDoc) {
      // Export Google Workspace files
      const exportMimeType =
        params.mimeType || getDefaultExportMimeType(mimeType!);

      const response = await apis.drive.files.export(
        {
          fileId,
          mimeType: exportMimeType,
        },
        {
          responseType: 'text',
        }
      );

      content = response.data as string;
    } else {
      // Download regular files
      const response = await apis.drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        {
          responseType: 'text',
        }
      );

      content = response.data as string;
    }

    return {
      success: true,
      data: {
        fileName: metadata.data.name,
        mimeType: mimeType,
        content,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

function getDefaultExportMimeType(googleMimeType: string): string {
  const exportMap: Record<string, string> = {
    'application/vnd.google-apps.document': 'text/plain',
    'application/vnd.google-apps.spreadsheet':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.presentation':
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.google-apps.drawing': 'image/png',
  };

  return exportMap[googleMimeType] || 'text/plain';
}
