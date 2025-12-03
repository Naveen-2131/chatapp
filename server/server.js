const express = require('express') 
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const path = require('path')

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)

// ✅ SINGLE CORS (FIXED)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://chatapp-client-bice.vercel.app",
    "https://realtimechatapp8870.netlify.app",

    // ✅ YOUR VERCEL DOMAINS
    "https://chatapp1-lime.vercel.app",
    "https://chatapp1-git-main-naveens-projects-fd8f3bd9.vercel.app",
    "https://chatapp1-44v9tjmmd-naveens-projects-fd8f3bd9.vercel.app",

    // ✅ NEW DOMAIN ADDED
    "https://chatapp-chi-nine.vercel.app"
  ],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ✅ CREATE SOCKET.IO INSTANCE (FIXED)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://chatapp-client-bice.vercel.app",
      "https://realtimechatapp8870.netlify.app",

      // ✅ YOUR VERCEL DOMAINS
      "https://chatapp1-lime.vercel.app",
      "https://chatapp1-git-main-naveens-projects-fd8f3bd9.vercel.app",
      "https://chatapp1-44v9tjmmd-naveens-projects-fd8f3bd9.vercel.app",

      // ✅ NEW DOMAIN ADDED
      "https://chatapp-chi-nine.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// ✅ PASS IO TO SOCKET HANDLER
require('./socket/socketHandler')(io)

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/conversations', require('./routes/conversationRoutes'))
app.use('/api/messages', require('./routes/messageRoutes'))
app.use('/api/groups', require('./routes/groupRoutes'))
app.use('/api/notifications', require('./routes/notificationRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!', error: err.message })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
  
