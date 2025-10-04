import type { GoogleAPIs } from '../index.js';
import type { ShareFileParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateFileId, validateEmail, validateEnum } from '../../utils/validators.js';

export async function shareFile(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as ShareFileParams;
    const fileId = validateFileId(params.fileId);
    const email = validateEmail(params.email);
    const role = validateEnum(params.role, 'role', ['reader', 'writer', 'commenter'] as const);

    const response = await apis.drive.permissions.create({
      fileId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
      fields: 'id, emailAddress, role, type',
    });

    return {
      success: true,
      data: {
        permissionId: response.data.id,
        emailAddress: response.data.emailAddress,
        role: response.data.role,
        message: `File shared with ${email} as ${role}`,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
