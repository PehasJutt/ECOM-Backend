import Stripe from 'stripe';

import { Users } from '../models'; 
const { STRIPE_SECRET_KEY } = process.env;
import {
  sendForgotMail,
  sendWelcomeMail,
  // sendVerificationeMail
} from '../utils';

const stripe = Stripe(STRIPE_SECRET_KEY);

const checkUserExistance = async (email) => {
  const user = await Users.findOne({ email });

  return user;
};

const Signup = async (name, email, password) => {
  const existingUser = await checkUserExistance (email);
  if (!existingUser) {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });
    const newUser = new Users({
      name: name,
      email: email,
      password: password,
      stripeId: customer.id,
      image: '',
      type: 'user'
    });
    const user = await newUser.save();
    if (user) {
      sendWelcomeMail(email, user.name);

      return user;
    } else return null;  
  } else return 'error';
};

const Login = async (email, password) => {
  const user = await checkUserExistance (email);
  console.log(user);
  if (user) {
    const isPassCorrect = await user.comparePassword(password, user.password);
    if (isPassCorrect) {
      return user;
    } else {
      return 'error';
    }
  } else 
    return null;
  
};

const forgotPasswordMail = async (email, token) => {
  sendForgotMail(email, token);

  return;
};

const ResetPassword = async(email, newPassword) => {
  return (
    await Users.findOneAndUpdate(
      { email:email },
      { password: newPassword },
      { new:true })
  );  
};

const deleteAccount = async (email, password) => {
  const user = await checkUserExistance (email);
  if (user) {
    const isPassCorrect = await user.comparePassword(password, user.password);
    if (isPassCorrect) {
      await  Users.findOneAndDelete({ email:email,
        password:password });
 
      return true;
    } else {
      return false;
    }
  } else 
    return false;
};
  
export {
  Signup,
  Login,
  checkUserExistance,
  forgotPasswordMail,
  ResetPassword,
  deleteAccount
};
