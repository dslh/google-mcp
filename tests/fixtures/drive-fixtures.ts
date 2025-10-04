import type { drive_v3 } from 'googleapis';

export const mockDriveFile: drive_v3.Schema$File = {
  id: 'file-123',
  name: 'Test Document.pdf',
  mimeType: 'application/pdf',
  modifiedTime: '2024-01-01T12:00:00.000Z',
  size: '1024',
  webViewLink: 'https://drive.google.com/file/d/file-123/view',
  parents: ['folder-456'],
};

export const mockDriveFilesListResponse: drive_v3.Schema$FileList = {
  files: [
    mockDriveFile,
    {
      id: 'file-456',
      name: 'Another Document.docx',
      mimeType: 'application/vnd.google-apps.document',
      modifiedTime: '2024-01-02T12:00:00.000Z',
      webViewLink: 'https://drive.google.com/file/d/file-456/view',
    },
  ],
  nextPageToken: 'next-page-token',
};

export const mockDriveFolder: drive_v3.Schema$File = {
  id: 'folder-123',
  name: 'Test Folder',
  mimeType: 'application/vnd.google-apps.folder',
  modifiedTime: '2024-01-01T12:00:00.000Z',
};

export const mockPermission: drive_v3.Schema$Permission = {
  id: 'permission-123',
  type: 'user',
  role: 'reader',
  emailAddress: 'test@example.com',
};
