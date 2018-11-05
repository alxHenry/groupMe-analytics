import * as bodyParser from 'body-parser';
import * as express from 'express';
import analyticsRoutes from './api/routes/analyticsRoutes';
import { shutdownDB } from './database';

const app = express();
const port = process.env.PORT || 8080;

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

analyticsRoutes(app);

app.listen(port);

console.log('RESTful API server started on: ' + port);

// More graceful fallback
app.use((req, res) => {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

process.on('SIGTERM', () => {
  shutdownDB();
});
