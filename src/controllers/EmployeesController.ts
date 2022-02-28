import { Request, Response } from 'express';

import { EmployeeModel } from '../model/schemas/Employee';

export interface Employee {
  firstname: string;
  lastname: string;
}

export class EmployeesController {
  async getAllEmployees(req: Request, res: Response) {
    const employess = await EmployeeModel.find();

    if (!employess) {
      return res.status(204).json({ message: 'No employees found.' });
    }

    return res.json(employess);
  }

  async getEmployee(req: Request, res: Response) {
    if (!req?.params?.id) {
      return res.status(400).json({ message: `Employee ID is required.` });
    }

    const employee = await EmployeeModel.findOne({
      _id: req.params.id,
    }).exec();

    if (!employee) {
      return res
        .status(204)
        .json({ message: `Employee ID ${req.params.id} not found` });
    }

    return res.json(employee);
  }

  async createEmployee(req: Request<{}, {}, Employee>, res: Response) {
    if (!req?.body?.firstname || !req?.body?.lastname) {
      return res
        .status(400)
        .json({ message: 'First and last names are required.' });
    }

    try {
      const result = await EmployeeModel.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      });
      return res.status(201).json(result);
    } catch (err) {
      return res.sendStatus(500);
    }
  }

  async updateEmployee(req: Request<{id: string}, {}, Employee>, res: Response) {
    if (!req?.params?.id) {
      return res.status(400).json({ message: `Employee ID is required.` });
    }

    const employee = await EmployeeModel.findOne({
      _id: req.params.id,
    }).exec();

    if (!employee) {
      return res
        .status(204)
        .json({ message: `Employee ID ${req.params.id} not found.` });
    }

    if (req.body?.firstname) {
      employee.firstname = req.body.firstname;
    } 

    if (req.body?.lastname) {
      employee.lastname = req.body.lastname;
    }

    const result = employee.save();

    return res.json(result);
  }

  async deleteEmployee(req: Request, res: Response) {
    if (!req?.params?.id) {
      return res.status(400).json({ message: `Employee ID is required.` });
    }

    const employee = await EmployeeModel.findOne({
      _id: req.params.id,
    }).exec();

    if (!employee) {
      return res
        .status(204)
        .json({ message: `Employee ID ${req.params.id} not found` });
    }

    employee.deleteOne({_id: req.params.id});

    return res.json({message: 'Employee deleted.'});
  }
}
