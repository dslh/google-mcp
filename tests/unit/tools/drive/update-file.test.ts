import { describe, it, expect, vi } from 'vitest';
import { updateFile } from '../../../../src/tools/drive/update-file.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('drive/update-file', () => {
  it('should update file content', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(
      createGaxiosResponse({
        mimeType: 'text/plain',
      })
    );
    vi.mocked(apis.drive.files.update).mockResolvedValue(
      createGaxiosResponse({
        id: 'file-123',
        name: 'updated.txt',
        mimeType: 'text/plain',
        modifiedTime: '2024-01-15T12:00:00.000Z',
        webViewLink: 'https://drive.google.com/file/d/file-123/view',
      })
    );

    const result = await updateFile(
      {
        fileId: 'file-123',
        content: 'Updated content',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('file-123');
    expect(apis.drive.files.get).toHaveBeenCalledWith({
      fileId: 'file-123',
      fields: 'mimeType',
    });
    expect(apis.drive.files.update).toHaveBeenCalledWith({
      fileId: 'file-123',
      media: expect.objectContaining({
        mimeType: 'text/plain',
      }),
      fields: 'id, name, mimeType, modifiedTime, webViewLink',
    });
  });

  it('should preserve file mimeType', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(
      createGaxiosResponse({
        mimeType: 'application/json',
      })
    );
    vi.mocked(apis.drive.files.update).mockResolvedValue(
      createGaxiosResponse({
        id: 'file-456',
        mimeType: 'application/json',
      })
    );

    await updateFile(
      {
        fileId: 'file-456',
        content: '{"updated": true}',
      },
      apis
    );

    expect(apis.drive.files.update).toHaveBeenCalledWith(
      expect.objectContaining({
        media: expect.objectContaining({
          mimeType: 'application/json',
        }),
      })
    );
  });

  it('should use text/plain as default mimeType', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(
      createGaxiosResponse({
        mimeType: undefined,
      })
    );
    vi.mocked(apis.drive.files.update).mockResolvedValue(
      createGaxiosResponse({
        id: 'file-789',
      })
    );

    await updateFile(
      {
        fileId: 'file-789',
        content: 'content',
      },
      apis
    );

    expect(apis.drive.files.update).toHaveBeenCalledWith(
      expect.objectContaining({
        media: expect.objectContaining({
          mimeType: 'text/plain',
        }),
      })
    );
  });

  it('should validate fileId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await updateFile(
      {
        fileId: 'invalid file',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should validate content is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await updateFile(
      {
        fileId: 'file-123',
        content: '',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('content');
  });

  it('should handle file not found error', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('File not found');
    (error as any).code = 404;
    vi.mocked(apis.drive.files.get).mockRejectedValue(error);

    const result = await updateFile(
      {
        fileId: 'nonexistent',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });

  it('should handle update errors', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(
      createGaxiosResponse({ mimeType: 'text/plain' })
    );
    const error = new Error('Permission denied');
    (error as any).code = 403;
    vi.mocked(apis.drive.files.update).mockRejectedValue(error);

    const result = await updateFile(
      {
        fileId: 'file-123',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
