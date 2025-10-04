import { describe, it, expect, vi } from 'vitest';
import { createFile } from '../../../../src/tools/drive/create-file.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('drive/create-file', () => {
  it('should create file with name and content', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.create).mockResolvedValue(
      createGaxiosResponse({
        id: 'file-123',
        name: 'test.txt',
        mimeType: 'text/plain',
        webViewLink: 'https://drive.google.com/file/d/file-123/view',
      })
    );

    const result = await createFile(
      {
        name: 'test.txt',
        content: 'Hello World',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('file-123');
    expect(result.data?.name).toBe('test.txt');
    expect(apis.drive.files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          name: 'test.txt',
        },
        media: expect.objectContaining({
          mimeType: 'text/plain',
        }),
      })
    );
  });

  it('should create file with custom mimeType', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.create).mockResolvedValue(
      createGaxiosResponse({
        id: 'file-456',
        name: 'data.json',
        mimeType: 'application/json',
      })
    );

    await createFile(
      {
        name: 'data.json',
        content: '{"key": "value"}',
        mimeType: 'application/json',
      },
      apis
    );

    expect(apis.drive.files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        media: expect.objectContaining({
          mimeType: 'application/json',
        }),
      })
    );
  });

  it('should create file in specified folder', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.create).mockResolvedValue(
      createGaxiosResponse({
        id: 'file-789',
        name: 'file.txt',
      })
    );

    await createFile(
      {
        name: 'file.txt',
        content: 'content',
        folderId: 'folder-123',
      },
      apis
    );

    expect(apis.drive.files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: {
          name: 'file.txt',
          parents: ['folder-123'],
        },
      })
    );
  });

  it('should validate name is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createFile(
      {
        name: '',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('name');
  });

  it('should validate content is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createFile(
      {
        name: 'test.txt',
        content: '',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('content');
  });

  it('should validate folderId if provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createFile(
      {
        name: 'test.txt',
        content: 'test',
        folderId: 'invalid folder id',
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

    const result = await createFile(
      {
        name: 'test.txt',
        content: 'test',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
