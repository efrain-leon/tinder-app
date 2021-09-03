import mongoose from 'mongoose';

import validatorUtils from '../../utils/validator.utils';
import imagesValidator from './images.validator';
import crudModel from '../core/model';

import dateUtils from '../../utils/date.utils';

const imageSchema = new mongoose.Schema({
  identifier: {type: Number, required: true},
  direction: {type: String, required: true},
  like: {type: Boolean},
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
const parentCreate = model.create;

model.create = async (data) => {
  try {
	  switch(data.direction) {
			case 'right':
				data.like = true;
				break;
			case 'left':
				data.like = false;
				break;
		}

    const dataCreated = await parentCreate(data);

    return dataCreated;
  }
  catch(err) {
    console.log(err);
    throw err;
  }
};

export default model;