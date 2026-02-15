import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import airlinesRoutes from './airline.routes';
import passengerRoutes from './passenger.routes';
import flightRoutes from './flight.routes';
import extraRoutes from './extra.routes';
import { verifyRole, verifyToken } from '../utils/middlewares/auth.middleware';
import { UserRole } from '../types/auth.types';


const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/airline', verifyToken, verifyRole(UserRole.AIRLINE), airlinesRoutes);
router.use('/passenger', verifyToken, verifyRole(UserRole.PASSENGER), passengerRoutes);
router.use('/flights', flightRoutes);
router.use('/', extraRoutes);

export default router;