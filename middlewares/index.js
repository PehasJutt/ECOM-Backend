import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

const ApplyMiddlewares = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.static('public/images'));
  app.use(session({ secret: 'Qbatch',
    resave: false,
    saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());
};

export default ApplyMiddlewares;

