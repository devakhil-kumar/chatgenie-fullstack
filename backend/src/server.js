import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import session from 'express-session';

import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { socketHandler } from './services/socketService.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
// import chatRoutes from './routes/chat.js';
// import groupRoutes from './routes/group.js';
// import aiRoutes from './routes/ai.js';
// import referralRoutes from './routes/referral.js';
// import paymentRoutes from './routes/payment.js';

// Middleware imports
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }
});

const PORT = process.env.PORT || 5500;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
// app.use('/api/chats', authenticateToken, chatRoutes);
// app.use('/api/groups', authenticateToken, groupRoutes);
// app.use('/api/ai', authenticateToken, aiRoutes);
// app.use('/api/referral', authenticateToken, referralRoutes);
// app.use('/api/payments', authenticateToken, paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ChatGenie API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
socketHandler(io);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`🚀 ChatGenie server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

export default app;