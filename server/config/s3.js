const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const USE_S3 = BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

// Configure S3 Client (only if credentials are available)
let s3Client = null;
if (USE_S3) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Local storage configuration (fallback when S3 is not configured)
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(uploadsDir, String(req.userId));
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  }
});

// Configure multer with S3 or local storage
let upload;
if (USE_S3) {
  upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const userId = req.userId;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `profiles/${userId}/${timestamp}${ext}`;
        cb(null, filename);
      }
    }),
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });
  console.log('Using S3 storage for file uploads');
} else {
  upload = multer({
    storage: localStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });
  console.log('Using local storage for file uploads (S3 not configured)');
}

// Delete file from S3 or local storage
const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (USE_S3 && fileUrl.includes(BUCKET_NAME)) {
      // Delete from S3
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });

      await s3Client.send(command);
      console.log('File deleted from S3:', key);
    } else if (fileUrl.includes('/uploads/')) {
      // Delete from local storage
      const filePath = path.join(__dirname, '..', fileUrl.replace(/^.*\/uploads/, 'uploads'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted from local storage:', filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Get S3 URL for a file
const getS3Url = (key) => {
  if (USE_S3) {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
  }
  return `/uploads/profiles/${key}`;
};

module.exports = {
  upload,
  deleteFromS3,
  getS3Url,
  s3Client,
  BUCKET_NAME,
  USE_S3
};
