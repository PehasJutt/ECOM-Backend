import mongoose from 'mongoose';

const prodSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  stock: Number,
  color: String,
  size: String,
  thumbnail: String,
  images: Array,
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

const Products  = mongoose.model('Products', prodSchema);
export default Products;
