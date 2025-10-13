import { Router } from 'express';
import airportRoutes from './airport.routes';

const router = Router();

router.use('/airports', airportRoutes);

export default router;