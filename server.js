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
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const fileName = `audio/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = `https://pub-82d37aadf5584663b80fc64f54a49180.r2.dev/${fileName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = `https://pub-82d37aadf5584663b80fc64f54a49180.r2.dev/${fileName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`R2 upload service running on port ${PORT}`);
});> {
  console.log(`File upload server running on port ${PORT}`);
});
