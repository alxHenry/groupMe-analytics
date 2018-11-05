import { Express } from 'express';
import { startGroupMeAnalyticsForGroup } from '../controllers/analyticsController';

const analyticsRoutes = (app: Express) => {
  app.route('/analytics/:groupId').get(startGroupMeAnalyticsForGroup);
};

export default analyticsRoutes;
