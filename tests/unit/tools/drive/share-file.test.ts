import { describe, it, expect, vi } from 'vitest';
import { shareFile } from '../../../../src/tools/drive/share-file.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockPermission } from '../../../fixtures/drive-fixtures.js';

describe('drive/share-file', () => {
  it('should share file with user as reader', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.permissions.create).mockResolvedValue(
      createGaxiosResponse(mockPermission)
    );

    const result = await shareFile(
      {
        fileId: 'file-123',
        email: 'test@example.com',
        role: 'reader',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.permissionId).toBe('permission-123');
    expect(result.data?.emailAddress).toBe('test@example.com');
    expect(result.data?.role).toBe('reader');
    expect(result.data?.message).toContain('shared with test@example.com');
    expect(apis.drive.permissions.create).toHaveBeenCalledWith({
      fileId: 'file-123',
      requestBody: {
        type: 'user',
        role: 'reader',
        emailAddress: 'test@example.com',
      },
      fields: 'id, emailAddress, role, type',
    });
  });

  it('should share file with writer role', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.permissions.create).mockResolvedValue(
      createGaxiosResponse({ ...mockPermission, role: 'writer' })
    );

    await shareFile(
      {
        fileId: 'file-123',
        email: 'writer@example.com',
        role: 'writer',
      },
      apis
    );

    expect(apis.drive.permissions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          role: 'writer',
        }),
      })
    );
  });

  it('should share file with commenter role', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.permissions.create).mockResolvedValue(
      createGaxiosResponse({ ...mockPermission, role: 'commenter' })
    );

    await shareFile(
      {
        fileId: 'file-123',
        email: 'commenter@example.com',
        role: 'commenter',
      },
      apis
    );

    expect(apis.drive.permissions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          role: 'commenter',
        }),
      })
    );
  });

  it('should validate fileId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await shareFile(
      {
        fileId: 'invalid file',
        email: 'test@example.com',
        role: 'reader',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should validate email format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await shareFile(
      {
        fileId: 'file-123',
        email: 'invalid-email',
        role: 'reader',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('Invalid email');
  });

  it('should validate role is valid', async () => {
    const apis = createMockGoogleAPIs();

    const result = await shareFile(
      {
        fileId: 'file-123',
        email: 'test@example.com',
        role: 'owner',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('must be one of');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Permission denied');
    (error as any).code = 403;
    vi.mocked(apis.drive.permissions.create).mockRejectedValue(error);

    const result = await shareFile(
      {
        fileId: 'file-123',
        email: 'test@example.com',
        role: 'reader',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
