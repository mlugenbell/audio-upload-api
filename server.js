const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Log all environment variables (without exposing secrets)
console.log('R2 Config:', {
  endpoint: process.env.R2_ENDPOINT,
  bucket: process.env.R2_BUCKET_NAME,
  hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY
});

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;

app.get('/', (req, res) => {
  res.json({ status: 'R2 upload service running' });
});

app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    console.log('Audio upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log('File received:', {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    const fileName = `audio/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    console.log('Uploading to R2 as:', fileName);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);
    console.log('Upload successful!');

    const publicUrl = `https://pub-82d37aadf5584663b80fc64f54a49180.r2.dev/${fileName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

app.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    console.log('Video upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log('File received:', {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
    console.log('Uploading to R2 as:', fileName);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);
    console.log('Upload successful!');

    const publicUrl = `https://pub-82d37aadf5584663b80fc64f54a49180.r2.dev/${fileName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`R2 upload service running on port ${PORT}`);
});
