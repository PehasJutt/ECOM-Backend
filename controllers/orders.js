/* eslint-disable camelcase */
import Stripe from 'stripe';

import {
  Orders,
  Products,
  DashboardStats,
  Notifications,
  Users
} from '../models';

const { PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;

const stripe = Stripe(STRIPE_SECRET_KEY);
const publicStripe = Stripe(PUBLISHABLE_KEY);


const SearchOrdersById = async (id) => {
  const regex = new RegExp(id, 'i');
  const orders = await Orders.find({
    $expr: {
      $regexMatch: {
        input: { $toString: '$_id' },
        regex,
      },
    },
  })
    .populate({
      path: 'cartItems.prodId',
      model: 'Products', 
    })
  ;

  return (orders);
};

const GetTopSellingProducts = async () => {
  const { topSellingProds } = await DashboardStats.findOne();

  return topSellingProds;
};

const GetOrderById = async (id) => {
  return (
    await Orders.findOne({ _id: id })
      .populate({
        path: 'cartItems.prodId',
        model: 'Products', 
      })
  );
};

const markOrderPaid = async (id) => {
  return (
    await Orders.updateOne({ _id: id }, { isPaid: true })
  );
};

const GetOrders = async (skip = 0, limit = 10) => {
  return (await Orders.find()
    .populate({
      path: 'cartItems.prodId',
      model: 'Products', 
    })
    .sort({ createdOn: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
  );
};

const GetUserOrders = async (id) => {
  return (await Orders.find({ userId: id })
    .populate({
      path: 'cartItems.prodId',
      model: 'Products', 
    })
  );
};

const GetOrderStats = async () => {
  const { orderStats } = await DashboardStats.findOne();

  return orderStats;
};

const AddNewCard = async ({ userId, cvc, num, exp }) => {
  const [expMon, expYear] = exp.split('/');
  const user = await Users.findOne({ _id: userId });

  if (user) {
    if (user.stripeId) {
      const card_Token = await publicStripe.tokens.create({
        card: {
          cvc,
          number: num,
          exp_month: expMon,
          exp_year: expYear,
        },
      });
    
      const newCard = await stripe.customers.createSource(user.stripeId, {
        source: `${card_Token.id}`,
      });

      return newCard;
    } else {
      const customer = await stripe.customers.create({
        name: user.name,
        email: user.email,
      });
  
      await Users.updateOne({ _id: userId }, { stripeId: customer.id });
  
      const card_Token = await publicStripe.tokens.create({
        card: {
          cvc,
          number: num,
          exp_month: expMon,
          exp_year: expYear,
        },
      });
    
      const newCard = await stripe.customers.createSource(customer.id, {
        source: `${card_Token.id}`,
      });

      return newCard;
    }
  } else {

    return false;
  }
};

const AddOrder = async (orderData) => {
  const { userId } = orderData;
  const user = await Users.findOne({ _id: userId });
  if (user) {
    for (const item of orderData.cartItems) {
      const productId = item.prodId;
      const quantityOrdered = item.qty;
  
      await Products.findByIdAndUpdate(
        { _id: productId },
        { $inc: { stock: -quantityOrdered } },
        { new: true }
      );
    }
    const newOrder = new Orders(orderData);
    const savedOrder = await newOrder.save();

    const orderIdStr = savedOrder._id.toString() + '';
   
    await stripe.charges.create({
      receipt_email: user.email,
      amount: orderData.total * 100,
      currency: 'USD',
      card: orderData.billingInfo.cardId,
      customer: user.stripeId,
      metadata: { orderId: orderIdStr }
    });
  
    const admin = await Users.findOne({ type: 'admin' });
    const notification = new Notifications({
      reciever: admin._id,
      body: `Order '${savedOrder._id}' was just placed `
    });
    await notification.save();

    return (savedOrder);
  }

  return (false);

};

const GetDashboardStats = async () => {
  const {
    todayStats,
    sevenDayStats,
    thirtyDayStats
  } = await DashboardStats.findOne();

  return {
    todayStats,
    sevenDayStats,
    thirtyDayStats
  };
};

const MarkDelivered = async (id) => {
  const order = await Orders.findByIdAndUpdate({ _id:id }, { isDelivered: true });
  const notification = new Notifications({
    reciever: order.userId,
    body: `Your Order '${order._id}' has been delivered.`
  });
  await notification.save();

  return (order);
};

const GetAnnualStats = async () => {
  const { annualStats } = await DashboardStats.findOne();

  return annualStats;
};

export {
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
  AddNewCard,
  markOrderPaid
};