import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

export const modelEmployee = mongoose.model('Employee', employeeSchema);