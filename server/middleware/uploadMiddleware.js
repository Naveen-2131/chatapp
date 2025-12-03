const multer = require('multer');
const path = require('path');
const fs = require('fs');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '-' + Date.now() + ext;
        cb(null, name);
    }
});

// File type validation
function checkFileType(file, cb) {
    const allowedMimetypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'video/mp4',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExts = /jpeg|jpg|png|gif|mp4|pdf|doc|docx/;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mimetypeAllowed = allowedMimetypes.includes(file.mimetype);

    if (extname && mimetypeAllowed) return cb(null, true);
    cb('Error: Only images, videos, PDF, and Word docs are allowed');
}

// Multer instance
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => checkFileType(file, cb)
}).any(); // Accept any field name

// Middleware wrapper
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
        if (err) return res.status(400).json({ message: typeof err === 'string' ? err : err.message });

        // Attach first file to req.file for backward compatibility
        if (req.files && req.files.length > 0) {
            req.file = req.files[0];
            req.file.url = `${BACKEND_URL}/uploads/${req.file.filename}`;
        }
        next();
    });
};

module.exports = uploadMiddleware;
