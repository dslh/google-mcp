import { describe, it, expect, vi } from 'vitest';
import { getFileMetadata } from '../../../../src/tools/drive/get-file-metadata.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockDriveFile } from '../../../fixtures/drive-fixtures.js';

describe('drive/get-file-metadata', () => {
  it('should get file metadata', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(createGaxiosResponse(mockDriveFile));

    const result = await getFileMetadata({ fileId: 'file-123' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('file-123');
    expect(result.data?.name).toBe('Test Document.pdf');
    expect(result.data?.mimeType).toBe('application/pdf');
    expect(apis.drive.files.get).toHaveBeenCalledWith({
      fileId: 'file-123',
      fields: '*',
    });
  });

  it('should validate fileId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await getFileMetadata({ fileId: 'invalid file' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should handle file not found error', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('File not found');
    (error as any).code = 404;
    vi.mocked(apis.drive.files.get).mockRejectedValue(error);

    const result = await getFileMetadata({ fileId: 'file-123' }, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
