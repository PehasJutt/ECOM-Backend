import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  subTotal: Number,
  total: Number,
  taxPrcnt: Number,
  taxAmount: Number,
  isPaid: Boolean,
  isDelivered: Boolean,
  cartItems: [
    {
      prodId: { type: mongoose.Schema.Types.ObjectId,
        ref: 'Products', },
      price: Number,
      qty: Number
    }
  ],
  deliveryInfo: {
    name: String,
    location: String,
    phoneNum: String,
    deliveryCharges: Number
  },
  billingInfo: {
    cardNum: String, 
    cardExp: String,
    cardCvc: String
  }
});

const Orders  = mongoose.model('Orders', orderSchema);
export default Orders;


