import express from 'express';

import catchResponse from '../utils/catch-response';
import {
  GetNotifications,
  ReadNotification
} from '../controllers';

const router = express.Router();

router.get('/get-notifications', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const notifications = await GetNotifications(id);
      res.status(200).send({ notifications });
    } else {
      throw new Error('Cannot get Notifications');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/read-notification', async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const notification = await ReadNotification(id);
      console.log(notification);
      res.status(200).send(notification);
    } else {
      throw new Error('Cannot mark as read');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});
  
export default router;





