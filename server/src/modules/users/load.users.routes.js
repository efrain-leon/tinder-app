import mailerUtils from '../../utils/mailer.utils';
import pendingActivationModel from './pending.activations.model';
import userModel from './users.model';
import activationManager from './activation.manager';
import userRoutes from './users.routes';

export default (router) => {
  const mailer = mailerUtils();
  const _activationManager = activationManager(userModel, pendingActivationModel, mailer);
  userRoutes(router, _activationManager);
};
