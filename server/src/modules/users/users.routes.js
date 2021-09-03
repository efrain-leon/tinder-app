import _ from 'underscore';

import abstractRoutes from '../core/routes.with.company';
import userPermissions from './users.permissions';
import permissionsModel from '../permissions/permissions.model';
import userModel from './users.model';

export default (router, activationManager) => {
  const activateAccount = async (req, res) => {
    try {
      let token = req.body.token;
      let password = req.body.password;

      const updatedUser =  await activationManager.activateAccount(token, password);
      res.ok({email: updatedUser.email});
    }
    catch (err) {
      res.serverError(err.message);
    }
  };

  const validateToken = async (req, res) => {
    try {
    const validation = await activationManager.validateToken(req.query.token);

      if (validation) {
        return res.ok(validation);
      }

      return res.notFound();
    }
    catch (err) {
      res.serverError(err);
    }
  };

  const find = async (query, params) => {
    try {
      let users = await userModel.find(query, params);
      
      users = _.map(users, user =>  {
        delete user._doc.salt;
        delete user._doc.hash;
        return user;
      });
      
      return users;
    }
    catch (err) {
      throw err;
    }
  };

  const crudRoutes = abstractRoutes(router, { find: find, update: userModel.update }, '/users', userPermissions, []);

  const parentUpdate = crudRoutes.update;

  crudRoutes.update = async (req, res) => {
    try {
      req.returnInsteadOfResponse = true;
      
      let user = await parentUpdate(req, res);
      await user.populateProfiles();

      user._doc.profiles = _.where(user.profiles, {systemAccess: true});

      if (!user._doc.preferences.workingProfile.systemAccess) {
        user._doc.preferences.workingProfile = _.findWhere(user.profiles, {systemAccess: true});
      }

      await user.populateWorkingCompany();

      user._doc.type = user.preferences.workingProfile.getProfileType();

      let updatedUser = toPlain(user);

      if (!req.body.preferences && !req.body.preferences.workingProfile) {
        return res.ok(updatedUser);
      }

      let userPermissions = extractWorkingProfilePermissions(updatedUser);

      const permissionsPaths = await permissionsModel.findPaths(userPermissions);

      updatedUser.permissions = permissionsPaths;

      res.ok(updatedUser);
    }
    catch(err) {
      console.log(err, 'errs');
      res.serverError(err);
    };
  };

  crudRoutes.router.post('/activateAccount', activateAccount);
  crudRoutes.router.get('/validateToken', validateToken);

  crudRoutes.setup({
    create: false,
    update: true,
    get: true,
    remove: false
  });

  // return {
  //   routes: crudRoutes,
  //   activate: activate,
  // };
  return crudRoutes;
};

function extractWorkingProfilePermissions(user) {
  var permissions =  _.reduce(user.preferences.workingProfile.permissions, (result, permission_profile) => {
    return _.union(result, permission_profile.permissions);
  }, []);

  permissions = _.union(permissions, permissionsModel.requiredPermissions);

  return permissions;
}

function toPlain(element) {
  if (element.toObject) {
    return element.toObject();
  }

  return element;
}