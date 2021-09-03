import mongoose from 'mongoose';
import validatorUtils from '../../utils/validator.utils';
import pendingActivationValidator from './pending.activations.validator';
import crudModel from '../core/model';

const pendingActivationSchema = new mongoose.Schema({
  email: String,
  token: { type: String, index: true }
},
{
  collection: 'pending_activations'
});

const pendingActivationModel = mongoose.model('PendingActivation', pendingActivationSchema);
const validator = pendingActivationValidator(validatorUtils);
let model = crudModel(pendingActivationModel, validator);

export default model;