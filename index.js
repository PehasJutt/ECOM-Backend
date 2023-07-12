import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './config/database';
import ApplyMiddlewares from './middlewares';
import router from './routes';

const app = express();

app.use(cors());
ApplyMiddlewares(app);

app.use('/v1', router);

app.listen(process.env.PORT, () => {
  console.log(`app is listening to port ${process.env.PORT}`);
});
