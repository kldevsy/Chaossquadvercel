// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
registerRoutes(app);

export default app;