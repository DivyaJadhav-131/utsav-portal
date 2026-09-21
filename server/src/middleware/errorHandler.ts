import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Image must not exceed 5 MB' });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err.message === 'Only JPEG, PNG and WebP images are allowed') {
    res.status(400).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: err.message || 'Internal server error' });
};
