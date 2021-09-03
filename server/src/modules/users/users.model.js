import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import _ from 'underscore';

import crudModel from '../core/model';

import { serverConfig } from '../../config/server';
import dateUtils from '../../utils/date.utils';

import validatorUtils from '../../utils/validator.utils';
import usersValidator from './users.validator';

const ObjectId = mongoose.Schema.Types.ObjectId;

const profileSchema = {
  _id: ObjectId,
  collectionName: String
};

const userSchema = new mongoose.Schema({
  name: {type: String, required: true, uppercase: true},
  surname: {type: String, required: true, uppercase: true},
  email: {type: String, required: true, index: true},
  photo: { type: String, image: true },
  address: String,
  activated: {type: Boolean, default: true},
  enabled: {type: Boolean, default: true},
  salt: String,
  hash: String,
	createdAt: Number,
	updatedAt: Number
});

userSchema.pre('save', function(next) {
	if (!this.createdAt) {
		this.createdAt = dateUtils.currentDate();
	}
	this.updatedAt = dateUtils.currentDate();
	next();
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  if (!this.salt) {
    return false;
  }
  
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 10000);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    surname: this.surname,
    exp: parseInt(expiry.getTime() / 1000)
  }, serverConfig.TOKEN_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

const userModel = mongoose.model('User', userSchema);
const validator = usersValidator(validatorUtils);
const model = crudModel(userModel, validator);

export default model;
