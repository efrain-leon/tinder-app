import mongoose from 'mongoose';

import validatorUtils from '../../utils/validator.utils';
import imagesValidator from './images.validator';
import crudModel from '../core/model';

import dateUtils from '../../utils/date.utils';

const ObjectId = mongoose.Schema.Types.ObjectId;

const imageSchema = new mongoose.Schema({
  identifier: {type: Number, required: true},
  url: {type: String, required: true},
  likes: [{user: {type: ObjectId, ref: 'User'}, type: Boolean}],
	createdAt: Number,
	updatedAt: Number
});

imageSchema.pre('save', function(next) {
	if (!this.createdAt) {
		this.createdAt = dateUtils.currentDate();
	}
	this.updatedAt = dateUtils.currentDate();
	next();
});

let imageModel = mongoose.model('Image', imageSchema);

const validator = imagesValidator(validatorUtils);
const model = crudModel(imageModel, validator);

export default model;