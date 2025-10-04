import { describe, it, expect, vi } from 'vitest';
import { createFolder } from '../../../../src/tools/drive/create-folder.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockDriveFolder } from '../../../fixtures/drive-fixtures.js';

describe('drive/create-folder', () => {
  it('should create folder with name', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.create).mockResolvedValue(
      createGaxiosResponse(mockDriveFolder)
    );

    const result = await createFolder({ name: 'Test Folder' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('folder-123');
    expect(result.data?.name).toBe('Test Folder');
    expect(result.data?.mimeType).toBe('application/vnd.google-apps.folder');
    expect(apis.drive.files.create).toHaveBeenCalledWith({
      requestBody: {
        name: 'Test Folder',
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, name, mimeType, webViewLink',
    });
  });

  it('should create folder in parent folder', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.create).mockResolvedValue(
      createGaxiosResponse(mockDriveFolder)
    );

    await createFolder(
      {
        name: 'Subfolder',
        parentFolderId: 'parent-456',
      },
      apis
    );

    expect(apis.drive.files.create).toHaveBeenCalledWith({
      requestBody: {
        name: 'Subfolder',
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['parent-456'],
      },
      fields: 'id, name, mimeType, webViewLink',
    });
  });

  it('should validate name is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createFolder({ name: '' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('name');
  });

  it('should validate parentFolderId if provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createFolder(
      {
        name: 'Test',
        parentFolderId: 'invalid folder id',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Permission denied');
    (error as any).code = 403;
    vi.mocked(apis.drive.files.create).mockRejectedValue(error);

    const result = await createFolder({ name: 'Test' }, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
