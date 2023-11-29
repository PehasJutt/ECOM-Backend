import express from 'express';

import 'dotenv/config';
import './config';

import agenda from './jobs/agenda';
import { invokeDashboardJob } from './jobs';
import ApplyMiddlewares from './middlewares';
import router from './routes';

const app = express();

ApplyMiddlewares(app);
app.use('/', router);

(async () => {
  await agenda.start();
  invokeDashboardJob('15 minutes');
})();

app.listen(process.env.PORT, () => {
  console.log(`Express Server is listening to port ${process.env.PORT}`);
});
