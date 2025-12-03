// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Dynamic backend URL for uploads
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// -------------------- MIDDLEWARE --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://chatapp-client-bice.vercel.app",
  "https://realtimechatapp8870.netlify.app",
  "https://chatapp1-lime.vercel.app",
  "https://chatapp1-git-main-naveens-projects-fd8f3bd9.vercel.app",
  "https://chatapp1-44v9tjmmd-naveens-projects-fd8f3bd9.vercel.app",
  "https://chatapp-chi-nine.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// -------------------- SOCKET.IO --------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Pass io to socket handler
require('./socket/socketHandler')(io);

// -------------------- DATABASE --------------------
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// -------------------- ROUTES --------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// -------------------- UPLOADS --------------------
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Optional: endpoint to return full upload URL
app.get('/api/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  res.json({ url: `${BACKEND_URL}/uploads/${filename}` });
});

// -------------------- ERROR HANDLING --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
