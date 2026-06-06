const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const dotenv = require('dotenv');
// Load env vars
dotenv.config();


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n  🚀 Learn Station API running on port ${PORT}`);
  console.log(`  📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`  🔗 http://localhost:${PORT}\n`);
});
