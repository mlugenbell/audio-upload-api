const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use('/files', express.static(uploadsDir));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
  
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

app.get('/', (req, res) => {
  res.json({ status: 'Audio upload server running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this BEFORE the app.listen() line
app.post('/upload-base64', (req, res) => {
  const { audioBase64, filename } = req.body;
  
  if (!audioBase64) {
    return res.status(400).json({ error: 'No audio data' });
  }

  const buffer = Buffer.from(audioBase64, 'base64');
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
  const filepath = path.join(uploadsDir, uniqueName);
  
  fs.writeFileSync(filepath, buffer);
  
  const fileUrl = `${req.protocol}://${req.get('host')}/files/${uniqueName}`;
  
  res.json({
    success: true,
    url: fileUrl
  });
});

// Add body parser at the top with other requires
app.use(express.json({ limit: '50mb' }));
