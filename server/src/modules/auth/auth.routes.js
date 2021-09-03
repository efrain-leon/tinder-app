import express from 'express';
import passport from 'passport';
import _ from 'underscore';

import userModel from '../users/users.model';

const router = express.Router();

const authRoutes = function() {

  router.post('/api/auth/signin', (req, res) => {
    passport.authenticate('users', async (err, data, info) => {
      if (err) {
        return res.serverError(err);
      }

      if (info) {
        return res.notFound(info);
      }

      try {
        let user = await userModel.findById({_id: data._id}, {select: '-salt -hash -createdAt -updatedAt'});
        
        let resData = {
          user: user,
          token: user.generateJwt()
        };
        
        res.ok(resData);
      } catch (err) {
        res.serverError(err);
      }
    })(req, res);
  });

  router.post('/api/auth/signup', async (req, res) => {
    try {
      let user = await userModel.findOne({email: req.body.email});
      
      if (user) {
        return res.conflict('The email is already taken');
      }
      
      await userModel.create(req.body);
      user = await userModel.findOne({email: req.body.email}, {select: '-salt -hash -createdAt -updatedAt'});
      user.setPassword(req.body.password);
      await user.save();
        
      let resData = {
        user: user,
        token: user.generateJwt()
      };
      
      res.ok(resData);
    } catch (err) {
      console.log(err, '-------------------');
      return res.serverError(err);
    }
  });
  
  return router;
}

export default authRoutes;