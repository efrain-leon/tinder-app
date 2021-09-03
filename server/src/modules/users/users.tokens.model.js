import mongoose from 'mongoose';

const userTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  action: String,
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200
  }
}, {
  collection: 'users_tokens'
});

let UserToken = mongoose.model('UserToken', userTokenSchema);

export default UserToken;