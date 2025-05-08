import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.split('.')[0];
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      cb(new Error('Solo se permiten imágenes .jpg, .jpeg, .png'));
      return
    }
    cb(null, true);
  },
  limits: {
    files: 1 
  }
});