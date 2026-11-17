import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { verifyEmailConnection } from './utils/emailService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Ensure .env is always loaded from backend directory regardless of working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to MongoDB Database
connectDB();

// Verify Email SMTP Connection
verifyEmailConnection();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development server
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'LeaveEase Backend API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('LeaveEase API is running...');
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Endpoint Not Found - ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 [Server] LeaveEase backend running on port ${PORT}`);
  console.log(`📡 [API URL] http://localhost:${PORT}/api`);
});
