const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
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

// Local storage configuration — ALWAYS use local disk first, then try S3 in controller
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // For admin routes, use req.params.userId; for user routes, use req.userId
    const userId = req.params.userId || req.userId || 'unknown';
    const userDir = path.join(uploadsDir, String(userId));
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

// Always use local disk storage for multer — S3 upload happens in the controller
const upload = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
console.log(`Using local disk storage for multer uploads${USE_S3 ? ' (will attempt S3 upload after)' : ''}`);

// MIME type lookup for common image types
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

/**
 * Try to upload a local file to S3. If S3 fails:
 * - In production: throws error (no local storage on server)
 * - In development: falls back to local file URL
 *
 * @param {string} localFilePath - Absolute path to the local file (from multer)
 * @param {string} originalFilename - Original filename (used for extension/MIME detection)
 * @param {string} userId - User ID for organizing files in S3
 * @param {object} req - Express request object (used to build full URL for local fallback)
 * @returns {Promise<string>} The URL to use (S3 URL or local URL in dev)
 */
const isProduction = process.env.NODE_ENV === 'production';

const uploadFileWithFallback = async (localFilePath, originalFilename, userId, req) => {
  // Build the local URL path (relative path for serving via express.static)
  const normalizedPath = localFilePath.replace(/\\/g, '/');
  const uploadsIndex = normalizedPath.indexOf('uploads/');
  const relativePath = '/' + normalizedPath.substring(uploadsIndex);

  // Build full local URL using request info so frontend can access it cross-origin
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const localUrl = `${protocol}://${host}${relativePath}`;

  // If S3 is not configured
  if (!USE_S3 || !s3Client) {
    if (isProduction) {
      // Clean up local file and throw — no local storage in production
      try { fs.unlinkSync(localFilePath); } catch (e) { /* ignore */ }
      throw new Error('S3 is not configured. Photo uploads require S3 in production.');
    }
    console.log('S3 not configured, using local file:', localUrl);
    return localUrl;
  }

  // Try S3 upload
  try {
    const fileBuffer = fs.readFileSync(localFilePath);
    const ext = path.extname(originalFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const key = `profiles/${userId}/${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000, immutable'
    });

    await s3Client.send(command);
    const s3Url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    console.log('File uploaded to S3:', s3Url);

    // Always delete local temp file after successful S3 upload
    try {
      fs.unlinkSync(localFilePath);
      console.log('Local temp file deleted after S3 upload');
    } catch (unlinkErr) {
      console.warn('Could not delete local temp file:', unlinkErr.message);
    }

    return s3Url;
  } catch (s3Error) {
    console.error('S3 upload failed:', s3Error.message);

    if (isProduction) {
      // Clean up local file and throw — no local storage in production
      try { fs.unlinkSync(localFilePath); } catch (e) { /* ignore */ }
      throw new Error('Photo upload to S3 failed. Please check S3/IAM configuration.');
    }

    // Development only: fall back to local storage
    console.log('Falling back to local storage (dev mode):', localUrl);
    return localUrl;
  }
};

// Delete file from S3 or local storage
const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (USE_S3 && s3Client && fileUrl.includes(BUCKET_NAME)) {
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

/**
 * Upload a file buffer to S3 using PutObjectCommand.
 * Works with EC2 IAM Role (no access keys needed in production).
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
 */
const downloadFromS3 = async (key) => {
  if (!USE_S3 || !s3Client) {
    throw new Error('S3 is not configured.');
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
 */
const extractKeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.pathname.substring(1);
  } catch {
    return null;
  }
};

module.exports = {
  upload,
  deleteFromS3,
  getS3Url,
  uploadToS3,
  uploadFileWithFallback,
  downloadFromS3,
  getPresignedUrl,
  extractKeyFromUrl,
  s3Client,
  BUCKET_NAME,
  USE_S3,
  AWS_REGION
};
