const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';

// Check if explicit credentials are provided (for local development)
const hasExplicitCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

// USE_S3 is enabled if bucket is configured AND either:
// 1. Explicit credentials are provided (local dev), OR
// 2. USE_EC2_IAM_ROLE is true (EC2 with IAM role)
const USE_EC2_IAM_ROLE = process.env.USE_EC2_IAM_ROLE === 'true';
const USE_S3 = BUCKET_NAME && (hasExplicitCredentials || USE_EC2_IAM_ROLE);

// Configure S3 Client
let s3Client = null;
if (USE_S3) {
  const s3Config = {
    region: AWS_REGION
  };

  // Only provide explicit credentials if available (for local development)
  // On EC2 with IAM role, the SDK will automatically use instance metadata
  if (hasExplicitCredentials) {
    s3Config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    console.log('S3 configured with explicit credentials (local development mode)');
  } else if (USE_EC2_IAM_ROLE) {
    // No credentials needed - SDK will use EC2 instance metadata service (IMDS)
    console.log('S3 configured to use EC2 IAM role (production mode)');
  }

  s3Client = new S3Client(s3Config);
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
    return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  }
  return `/uploads/profiles/${key}`;
};

// MIME type lookup for common image types
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

/**
 * Upload a file buffer to S3 using PutObjectCommand.
 * Works with EC2 IAM Role (no access keys needed in production).
 *
 * @param {Buffer} fileBuffer - The file content as a Buffer
 * @param {string} originalFilename - Original filename (used for extension/MIME detection)
 * @param {string} folder - S3 key prefix (e.g. 'profiles/123')
 * @returns {Promise<{key: string, url: string}>} The S3 key and public URL
 */
const uploadToS3 = async (fileBuffer, originalFilename, folder = 'profiles') => {
  if (!USE_S3 || !s3Client) {
    throw new Error('S3 is not configured. Set AWS_S3_BUCKET and either provide credentials or enable USE_EC2_IAM_ROLE.');
  }

  const ext = path.extname(originalFilename).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    throw new Error(`Unsupported file type: ${ext}. Allowed: ${Object.keys(MIME_TYPES).join(', ')}`);
  }

  // Generate a unique key to prevent collisions
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const key = `${folder}/${uniqueSuffix}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'max-age=31536000, immutable'
  });

  await s3Client.send(command);

  return {
    key,
    url: getS3Url(key)
  };
};

/**
 * Download (get) a file from S3 using GetObjectCommand.
 * Returns the readable stream and metadata.
 *
 * @param {string} key - The S3 object key (e.g. 'profiles/123/1700000000.jpg')
 * @returns {Promise<{stream: ReadableStream, contentType: string, contentLength: number}>}
 */
const downloadFromS3 = async (key) => {
  if (!USE_S3 || !s3Client) {
    throw new Error('S3 is not configured. Set AWS_S3_BUCKET and either provide credentials or enable USE_EC2_IAM_ROLE.');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  const response = await s3Client.send(command);

  return {
    stream: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength
  };
};

/**
 * Generate a pre-signed URL for temporary access to a private S3 object.
 * Useful for serving images from a private bucket without making them public.
 *
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL validity in seconds (default: 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  if (!USE_S3 || !s3Client) {
    throw new Error('S3 is not configured.');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Extract the S3 key from a full S3 URL.
 *
 * @param {string} url - Full S3 URL (e.g. https://bucket.s3.region.amazonaws.com/profiles/123/img.jpg)
 * @returns {string|null} The key portion, or null if not a valid S3 URL
 */
const extractKeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.pathname.substring(1); // Remove leading slash
  } catch {
    return null;
  }
};

module.exports = {
  upload,
  deleteFromS3,
  getS3Url,
  uploadToS3,
  downloadFromS3,
  getPresignedUrl,
  extractKeyFromUrl,
  s3Client,
  BUCKET_NAME,
  USE_S3,
  AWS_REGION
};
