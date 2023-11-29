import express from 'express';

import catchResponse from '../utils/catch-response';
import {
  SaveAddresses,
  GetAddresses,
  SetDefaultAddress
} from '../controllers';

const router = express.Router();

router.get('/get-user-addresses', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const addressArr = await GetAddresses(id);
      res.status(200).send({ addressArr });
    } else {
      throw new Error('Cannot get Addresses');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/add-address', async (req, res) => {
  try {
    const { address } = req.body;
    if (address) {
      const notification = await SaveAddresses(address);
      console.log(notification);
      res.status(200).send(notification);
    } else {
      throw new Error('Cannot save address');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/set-default-address', async (req, res) => {
  try {
    const { userId, addressId } = req.body;
    if (userId && addressId) {
      const notification = await SetDefaultAddress({
        userId,
        addressId
      });
      console.log(notification);
      res.status(200).send(notification);
    } else {
      throw new Error('Cannot set as default');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});
  
export default router;





