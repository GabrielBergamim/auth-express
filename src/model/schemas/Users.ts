import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  roles: {
    User: { type: Number, default: 2001 },
    Editor: Number,
    Admin: Number,
  },
  refreshToken: { type: String },
});

export const UserModel = mongoose.model('User', userSchema);
