import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Q from 'q';
import _ from 'underscore';

import profilesModels from '../profiles/load.models';
import companyModel from '../companies/companies.model';

import serverConfig from '../../config/server';
import dateUtils from '../../utils/date.utils';

import validatorUtils from '../../utils/validator.utils';
import usersValidator from './users.validator';
import crudModel from '../core/model';

const ObjectId = mongoose.Schema.Types.ObjectId;

let profileSchema = {
  _id: ObjectId,
  collectionName: String
};

const userSchema = new mongoose.Schema({
  idCard: {type: String, required: true},
  idCardType: String,
  name: {type: String, required: true, uppercase: true},
  surname: {type: String, required: true, uppercase: true},
  email: {type: String, required: true, index: true},
  photo: { type: String, image: true },
  address: String,
  fixEmailIndexCheck: String,
  company: { type: ObjectId, ref: 'Company', index: true },
  profiles: [profileSchema],
  preferences: {
    workingCompany: { type: ObjectId, ref: 'Company' },
    workingProfile: ObjectId
  },
  activated: {type: Boolean, default: false},
  salt: String,
  hash: String,
  enabled: {type: Boolean, default: true},
	createdAt: Number,
	updatedAt: Number
});

userSchema.index({ idCard: 1, company: 1 }, { unique: true });
userSchema.index({ email: 1, company: 1}, { unique: true});

userSchema.pre('save', function(next) {
	if (!this.createdAt) {
		this.createdAt = dateUtils.currentDate();
	}
	this.updatedAt = dateUtils.currentDate();
	next();
});

// userSchema.post('save', (error, doc, next) => {
//   let customErrors = '';

//   if (error.errors) {
//     Object.keys(error.errors).forEach(function (item) {
//       if (customErrors) {
//         customErrors = customErrors + ', ';
//       }
//       customErrors = customErrors + 'Field ' + error.errors[item].path + ' is ' +  error.errors[item].kind;
//     });
//   }

//   if (error.name === 'BulkWriteError' && error.code === 11000) {
//     let index_name = keysUtils.getKeyError(error.message);
//     next(new Error(index_name + ' already exists!'));
//   }
//   else {
//     next(error);
//   }
// });

// userSchema.post('findOneAndUpdate', (error, doc, next) => {
//   if (error.name === 'MongoError' && error.code === 11000 && error.codeName === 'DuplicateKey') {
//     let index_name = keysUtils.getKeyError(error.message);
//     next(new Error(index_name + ' already exists!'));
//   }
//   else {
//     next(error);
//   }
// });

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'sha512').toString('hex');
};

userSchema.methods.getNewPassword = function(password) {
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  return {salt: salt, hash: hash};
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
    company: this.company,
    exp: parseInt(expiry.getTime() / 1000)
  }, serverConfig.TOKEN_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

userSchema.methods.hasWorkingCompany = function() {
  return (this._doc.preferences && _(this._doc.preferences).has('workingCompany') && this._doc.preferences.workingCompany !== '');
};

userSchema.methods.populateWorkingCompany = async function(params = {}) {
  const user = this.toObject();
  const _this = this;

  if (user.profiles[0].type === 'superadmin') {
    return this;
  }

  let company = await companyModel.findById(user.preferences.workingCompany, params);
  _this._doc.preferences.workingCompany = company.toObject();

  return _this;
};

userSchema.methods.populateProfiles = async function() {
  try {
    let user = this;
    let profileModel;

    let profilePromises = [];

    _.each(user.profiles, profile =>  {
      profileModel = profilesModels[profile.collectionName];
      profilePromises.push(profileModel.find({_id: profile._id}, {populate: true}));
    });

    let profilesResults = await Q.all(profilePromises);

    let profiles = _.flatten(profilesResults);

    _.each(profiles, profile => {
      profile._doc.type = profile.getProfileType();
    });

    user._doc.profiles = profiles;

    if (!user.preferences.workingProfile) {
      return;
    }

    const workingProfile = _.find(profiles, profile => {
      return profile._id.equals(user.preferences.workingProfile);
    });

    user._doc.preferences.workingProfile = workingProfile;

    return user;
  }
  catch (err) {
    throw err;
  }
};

const userModel = mongoose.model('User', userSchema);
const validator = usersValidator(validatorUtils);
let model = crudModel(userModel, validator);

// const abstractModel = crudModel(usersModel, validator, query);
const abstractModel = crudModel(userModel, validator)

model.create = function(element) {
  element.fixEmailIndexCheck = '';

  if (!element.email) {
    element.fixEmailIndexCheck = mongoose.Types.ObjectId();
  }

  return abstractModel.create(element);
};

model.update = async (changes, filterConditions) => {
  let user = await abstractModel.findById(changes._id);

  changes.fixEmailIndexCheck = '';

  const changingMailToBlank = (_.has(changes, 'email') && changes.email === '');
  const alreadyHasBlankMail  = ((!_.has(user._doc, 'email')) || _.has(user._doc, 'email') && user.email === '');

  if (changingMailToBlank) {
    changes.fixEmailIndexCheck = mongoose.Types.ObjectId();
  }

  if (!_(changes).has('email') && alreadyHasBlankMail){
    changes.fixEmailIndexCheck = mongoose.Types.ObjectId();
  }

  changes.preferences = JSON.parse(JSON.stringify(_.extend(user.preferences, changes.preferences)));
  return abstractModel.update(changes, filterConditions);
};

export default model;