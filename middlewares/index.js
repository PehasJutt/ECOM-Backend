import express from 'express';
import cors from 'cors';

const ApplyMiddlewares = (app) => {
  app.use(cors());
  app.use(express.json());
};

export default ApplyMiddlewares;
