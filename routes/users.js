import express from 'express';
import jwt from 'jsonwebtoken';

import Passport from '../config/passport';
import { 
  Signup,
  Login,
  forgotPasswordMail,
  ResetPassword,
  checkUserExistance
} from '../controllers';
import catchResponse from '../utils/catch-response';

const router = express.Router();

const isEmailValid = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return emailRegex.test(email);
};

function isPasswordValid(password) {
  if (password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const isReqValid = email && password;

    if ( isReqValid ) {
      if (isEmailValid(email) ) {
        if ( isPasswordValid(password) ) {

          const user = await Login(email, password);
          if ( user ) {
            if (user === 'error') {
              throw new Error('Incorrect Password');
            } else  {
              const token = jwt.sign({ id: user._id,
                email: user.email }, 'Qbatch', { expiresIn: '365d' });
              
              return res.status(200).send({ user,
                token });
            }
          } else {
            throw new Error('User not found');
          }

        } else {
          throw new Error ('Invalid Password');
        }
      } else {
        throw new Error ('Invalid Email');
      }
    } else {
      throw new Error ('Request Invalid: Empty Fields not allowed');
    }

  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;
    const isReqValid = name && email && password;

    if ( isReqValid ) {
      if ( isEmailValid(email) ) {
        if ( isPasswordValid(password) ) {

          const user = await Signup(name, email, password);
          if ( user ) {
            if (user === 'error') {
              throw new Error('Email Already Registered');
            } else {

              return res.status(200).send(user);
            }
          } else {
            throw new Error('Error Signing up');
          }

        } else {
          throw new Error ('Invalid Password');
        }
      } else {
        throw new Error ('Invalid Email');
      }
    } else {
      throw new Error ('Request Invalid: Empty Fields not allowed');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/reset', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.user.email;

    if ( password ) {
      if ( isEmailValid(email) ) {
        if ( isPasswordValid(password) ) {

          const user = await ResetPassword(email, password);
          if (user){
            return res.status(200).send(user);
          } else {
            throw new Error ('User Do Not Exist');
          }
        } else {
          throw new Error ('Invalid Password');
        }

      } else {
        throw new Error ('Invalid Email');
      }
    } else {
      throw new Error ('Request Invalid: Empty Fields not allowed');
    }    
    
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if ( email ) {
      if ( isEmailValid(email) ) {
        const user = await checkUserExistance(email);
        if ( user ) {
          console.log({ user });
          const token = jwt.sign(
            { 
              id: user._id,
              email: user.email
            },
            'Qbatch',
            { expiresIn: '15m' }
          );
          await forgotPasswordMail(email, token);
        } else {
          throw new Error ('User do not exist');
        }
        res.status(200).send({ email });
      } else {
        throw new Error ('Invalid Email');
      }
    } else {
      throw new Error ('Request Invalid: Empty Fields not allowed');
    }

  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});


export default router;





