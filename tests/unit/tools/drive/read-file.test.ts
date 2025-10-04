import { describe, it, expect, vi } from 'vitest';
import { readFile } from '../../../../src/tools/drive/read-file.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('drive/read-file', () => {
  it('should read regular file', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get)
      .mockResolvedValueOnce(
        createGaxiosResponse({
          mimeType: 'text/plain',
          name: 'test.txt',
        })
      )
      .mockResolvedValueOnce(createGaxiosResponse('File content here'));

    const result = await readFile({ fileId: 'file-123' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.fileName).toBe('test.txt');
    expect(result.data?.content).toBe('File content here');
    expect(result.data?.mimeType).toBe('text/plain');
  });

  it('should export Google Doc with default mime type', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(
      createGaxiosResponse({
        mimeType: 'application/vnd.google-apps.document',
        name: 'My Doc',
      })
    );
    vi.mocked(apis.drive.files.export).mockResolvedValue(
      createGaxiosResponse('Exported content')
    );

    const result = await readFile({ fileId: 'doc-123' }, apis);

    expect(result.success).toBe(true);
    expect(result.data?.content).toBe('Exported content');
    expect(apis.drive.files.export).toHaveBeenCalledWith(
      {
        fileId: 'doc-123',
        mimeType: 'text/plain',
      },
      { responseType: 'text' }
    );
  });

  it('should export Google Sheets with custom mime type', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.drive.files.get).mockResolvedValue(
      createGaxiosResponse({
        mimeType: 'application/vnd.google-apps.spreadsheet',
        name: 'My Sheet',
      })
    );
    vi.mocked(apis.drive.files.export).mockResolvedValue(
      createGaxiosResponse('Sheet data')
    );

    await readFile(
      {
        fileId: 'sheet-123',
        mimeType: 'text/csv',
      },
      apis
    );

    expect(apis.drive.files.export).toHaveBeenCalledWith(
      {
        fileId: 'sheet-123',
        mimeType: 'text/csv',
      },
      { responseType: 'text' }
    );
  });

  it('should validate fileId', async () => {
    const apis = createMockGoogleAPIs();

    const result = await readFile({ fileId: 'invalid file' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('invalid characters');
  });

  it('should handle file not found error', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('File not found');
    (error as any).code = 404;
    vi.mocked(apis.drive.files.get).mockRejectedValue(error);

    const result = await readFile({ fileId: 'file-123' }, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
