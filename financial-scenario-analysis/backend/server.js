import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import calculationsRouter from './routes/calculations.js';
import scenariosRouter from './routes/scenarios.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Financial Scenario Analysis Backend'
    });
});

app.use('/api/scenarios', scenariosRouter);
app.use('/api/calculate', calculationsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: `Route not found: ${req.method} ${req.path}`,
            status: 404
        }
    });
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`\n╔════════════════════════════════════════════════╗`);
        console.log(`║  Financial Scenario Analysis Backend           ║`);
        console.log(`║  Server running on http://localhost:${PORT}     ║`);
        console.log(`╚════════════════════════════════════════════════╝\n`);
    });
};

startServer().catch((error) => {
    console.error('Unable to start server:', error);
    process.exit(1);
});

export default app;
