import mongoose from 'mongoose';

const addressesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    name: String,
    contact: String,
    city: String,
    province: String,
    country: String,
    location: String
  },
  {
    timestamps: true
  }
);

const Addresses = mongoose.model('Addresses', addressesSchema);

export default Addresses;