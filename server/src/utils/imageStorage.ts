import { Request, Response, NextFunction } from 'express';
import mongoose, { Schema } from 'mongoose';
import { v4 as uuid } from 'uuid';

const Image = mongoose.model('EventImage', new Schema({
  _id: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
}));

// Small event posters use the existing database, avoiding a new storage account.
export async function saveImage(file: Express.Multer.File): Promise<string> {
  const extensions: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
  const name = uuid() + extensions[file.mimetype];
  await Image.create({ _id: name, contentType: file.mimetype, data: file.buffer });
  return `events/${name}`;
}

export async function removeImage(imagePath: string | null): Promise<void> {
  if (imagePath?.startsWith('events/')) await Image.deleteOne({ _id: imagePath.slice(7) });
  // Existing bundled files stay intact; deployment files are read-only.
}

export async function serveImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const image = await Image.findById(req.params.filename);
    if (!image) { next(); return; }
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(image.data);
  } catch (error) { next(error); }
}
