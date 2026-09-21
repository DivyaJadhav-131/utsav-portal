import fs from 'fs';
import path from 'path';

/**
 * Delete a file stored under the uploads directory.
 * @param relativePath  e.g. "events/abc123.jpg"
 */
export const deleteFile = (relativePath: string | null | undefined): void => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '../../uploads', relativePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};
