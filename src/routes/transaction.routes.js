import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller.js';

const router = Router();

router.post('/', transactionController.registrar);

export default router;
