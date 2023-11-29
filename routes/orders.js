import express from 'express';

import Passport from '../config/passport';
import catchResponse from '../utils/catch-response';
import {
  SearchOrdersById,
  GetTopSellingProducts,
  GetOrderById,
  AddOrder,
  GetOrders,
  GetUserOrders,
  GetOrderStats,
  GetDashboardStats,
  GetAnnualStats,
  MarkDelivered,
  AddNewCard
} from '../controllers';

const router = express.Router();

router.post('/add-payment-card', async (req, res) => {
  try {
    const { cardData } = req.body;
    if (cardData) {
      const card = await AddNewCard(cardData);
      if (card) res.status(200).send({ card });
      else throw new Error('Invalid Card Details');
    } else {
      throw new Error('Missing Card Details');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/place-order', async (req, res) => {
  try {
    const { orderData } = req.body;
    if (orderData) {
      const order = await AddOrder(orderData);
      if (order) res.status(200).send(order);
      else throw new Error('Cannot Find User');
    } else {
      throw new Error('Cannot add empty order');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/search-orders-by-id', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.type === 'admin') {
      const { orderId } = req.body;
      if (orderId) {
        const orders = await SearchOrdersById(orderId);
        if (orders) {
          const total = orders.length;
          res.status(200).send({ orders,
            total });
        } else {
          throw new Error('Something bad happened');
        }
      } else {
        throw new Error('Cannot add empty order');
      }
    } else {
      throw new Error ('Access Denied');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/top-selling-products', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.type === 'admin') {
      const products = await GetTopSellingProducts();
      res.status(200).send({ products });
    } else {
      throw new Error ('Access Denied');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/get-order-by-id', async (req, res) => {
  try {
    const { orderId } = req.body;
    // console.log('conming in: ',orderId);
    if (orderId) {
      const order = await GetOrderById(orderId);
      res.status(200).send(order);
    } else {
      throw new Error('Cannot search without Order Id');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/get-orders', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { skip, limit } = req.body;
    const orders = await GetOrders(skip, limit);
    res.status(200).send({ orders });
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/get-user-orders', async (req, res) => {
  try {
    const { id } = req.body;
    const orders = await GetUserOrders(id);
    console.log(orders);
    res.status(200).send({ orders });
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/mark-delivered', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { id } = req.body;
    const result = await MarkDelivered(id);
    let resObj = {};
    if (result) {
      resObj = {
        deliveryStatus: true
      };
    } else {
      resObj = {
        deliveryStatus: false
      };
    }
    res.status(200).send( resObj );
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.get('/get-order-stats', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const orderStats = await GetOrderStats();
    res.status(200).send({ 
      orderStats
    });
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.get('/get-dashboard-stats', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.type === 'admin') {
      const dashboardStats = await GetDashboardStats();
      res.status(200).send({ dashboardStats });
    } else {
      throw new Error ('Access Denied');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.get('/get-annual-stats', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.type === 'admin') {
      const resObj = await GetAnnualStats();
      res.status(200).send({ annualStats: resObj });
    } else {
      throw new Error ('Access Denied');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

export default router;





