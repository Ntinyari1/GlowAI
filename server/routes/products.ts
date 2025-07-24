// server/routes/products.ts
import { Router } from 'express';
import { getProducts } from '../controllers/productsController';

const router = Router();

router.get('/', getProducts);

export default router;
