import express from 'express';

import catchResponse from '../utils/catch-response';
import {
  markOrderPaid
} from '../controllers';

const router = express.Router();

router.post('/stripe', async (req, res) => {
  try {
    const metadata = req.body.data.object.metadata;
    const order = await markOrderPaid(metadata.orderId);
    if (order) {
      console.log(`Order #${metadata.orderId} was marked as paid.`);
      res.status(200).send(order);
    } else throw new Error ('Cannot Mark Order As Paid');
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

export default router;





