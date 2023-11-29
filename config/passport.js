import { checkUserExistance } from '../controllers';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');


const jwtSecret = 'Qbatch';

passport.use(
  new LocalStrategy(async (email, done) => {
    const user = await checkUserExistance(email);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);

    }
  })
);

passport.serializeUser((user, done) => {
  console.log('user ser.');
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  const user = await checkUserExistance(email);
  console.log('user de-ser.', user);
  done(null, user);
});

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    async (jwtPayload, done) => {
      const user = await checkUserExistance(jwtPayload.email);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  )
);

export default passport;
