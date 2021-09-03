import express from 'express';
import auth from '../config/auth';
import authMiddleware from '../modules/auth/middleware';

import authRoutes from './auth/auth.routes';
import imagesRoutes from '../modules/images/images.routes';

const apiPrefix = '/api';
const router = express.Router();

const routes = (app) => {
	app.use('/', authRoutes());
	
	router.use(auth);
	router.use(authMiddleware);
	
	imagesRoutes(router);

	app.use(apiPrefix, router);
}

export default routes;