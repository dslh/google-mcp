import { describe, it, expect, vi } from 'vitest';
import { listFiles } from '../../../../src/tools/drive/list-files.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockDriveFilesListResponse } from '../../../fixtures/drive-fixtures.js';

describe('drive/list-files', () => {
  it('should list files with default parameters', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse(mockDriveFilesListResponse)
    );

    const result = await listFiles({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.files).toBeDefined();
    expect(result.data?.files).toHaveLength(2);
    expect(apis.drive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 10,
      })
    );
  });

  it('should list files with custom maxResults', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse(mockDriveFilesListResponse)
    );

    await listFiles({ maxResults: 25 }, apis);

    expect(apis.drive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 25,
      })
    );
  });

  it('should list files with query parameter', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse(mockDriveFilesListResponse)
    );

    await listFiles({ query: "name contains 'test'" }, apis);

    expect(apis.drive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "name contains 'test'",
      })
    );
  });

  it('should list files with orderBy parameter', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse(mockDriveFilesListResponse)
    );

    await listFiles({ orderBy: 'modifiedTime desc' }, apis);

    expect(apis.drive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: 'modifiedTime desc',
      })
    );
  });

  it('should list files with pageToken for pagination', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse(mockDriveFilesListResponse)
    );

    await listFiles({ pageToken: 'next-page-token' }, apis);

    expect(apis.drive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        pageToken: 'next-page-token',
      })
    );
  });

  it('should validate maxResults is within bounds', async () => {
    const apis = createMockGoogleAPIs();

    const result = await listFiles({ maxResults: 150 }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('maxResults');
  });

  it('should return nextPageToken when available', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse(mockDriveFilesListResponse)
    );

    const result = await listFiles({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.nextPageToken).toBe('next-page-token');
  });

  it('should handle empty results', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.list).mockResolvedValue(
      createGaxiosResponse({ files: [] })
    );

    const result = await listFiles({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.files).toEqual([]);
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('API Error');
    (error as any).code = 403;
    vi.mocked(apis.drive.files.list).mockRejectedValue(error);

    const result = await listFiles({}, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
