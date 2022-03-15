import mongoose, { Schema } from 'mongoose';
import { User } from '../../controllers/RegisterController';


const userSchema = new Schema<User>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  roles: {
    User: { type: Number, default: 2001 },
    Editor: Number,
    Admin: Number,
  },
  refreshToken: [String],
});

export const UserModel = mongoose.model<User>('User', userSchema);
