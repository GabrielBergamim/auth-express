import mongoose, { Schema } from 'mongoose';

import { Employee } from '../../controllers/EmployeesController';

const employeeSchema = new Schema<Employee>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

export const EmployeeModel = mongoose.model<Employee>('Employee', employeeSchema);