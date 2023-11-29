import express from 'express';

import userRouter from './users';
import productsRouter from './products';
import ordersRouter from './orders';
import notificationRouter from './notifications';
import addressesRouter from './addresses';
import webhookRouter from './webhooks';

const router = express.Router();

router.use('/users', userRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/notifications', notificationRouter);
router.use('/addresses', addressesRouter);
router.use('/webhook', webhookRouter);

export default router;
