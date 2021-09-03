import _ from 'underscore';
import userModel from '../users/users.model';

const notAuthRequiredPaths = ['/login'];

const authorize = async (req, res, next) => {
  try {
    if (_.contains(notAuthRequiredPaths, req.path)) {
      return next();
    }

    let currentUser = await userModel.findById(req.payload._id, {select: 'name email'});
    
    if (!currentUser) {
      return res.unauthorized();
    }

    console.log('go innnn');

    currentUser = currentUser.toObject();
      
    req.payload.user = currentUser;

    next();
  }
  catch (err) {
    res.serverError(err);
  }
};

export default authorize;
