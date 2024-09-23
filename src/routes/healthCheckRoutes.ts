import { Router } from 'express';
import { ping } from '../controllers/healthCheckController';

const router = Router();

router.get('/ping', ping);
export default router;
