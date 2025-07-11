import express from 'express';
import adminRoutes from './adminRoutes.js';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';
import completedTaskRoutes from './completedTaskRoutes.js';
import cronRoutes from './cronRoutes.js';

const router = express.Router();

// Mount routes
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/completed-tasks', completedTaskRoutes);
router.use('/cron', cronRoutes);

export default router;