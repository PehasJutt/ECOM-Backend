import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String,
  type: String,
  stripeId: {
    type: mongoose.Schema.Types.String,
    default: null
  },
  defaultAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Addresses',
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('findOneAndUpdate', async function (next) {
  try {
    if (this._update.password) {
      const hashedPassword = await bcrypt.hash(this._update.password, 10);
      this._update.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return ( await bcrypt.compare(password, this.password) );
};

const Users  = mongoose.model('Users', userSchema);
export default Users;


