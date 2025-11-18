const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));

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

  // Force HTTPS for Railway deployments
  const protocol = req.get('host').includes('railway.app') ? 'https' : req.protocol;
  const fileUrl = `${protocol}://${req.get('host')}/files/${req.file.filename}`;
  
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

app.post('/upload-base64', (req, res) => {
  try {
    const { audioBase64, filename } = req.body;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'No audio data' });
    }

    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const filepath = path.join(uploadsDir, uniqueName);
    
    fs.writeFileSync(filepath, buffer);
    
    // Force HTTPS for Railway deployments
    const protocol = req.get('host').includes('railway.app') ? 'https' : req.protocol;
    const fileUrl = `${protocol}://${req.get('host')}/files/${uniqueName}`;
    
    res.json({
      success: true,
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process audio', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Audio upload server running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
