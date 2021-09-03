import model from './images.model';
import abstractRoutes from '../core/routes';

export default (router) => {
  const path = '/tinderAction';

  const routes = abstractRoutes(router, model, path);

  routes.setup({
    create: true,
    get: true,
    update: true
  });

  return routes;
}