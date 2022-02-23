import { Request, Response } from 'express';

import dataApi from '../model/employees.json';

export class EmployeesController {
  data = {
    employees: dataApi,
    setEmployees: function (data) {
      this.employees = data;
    },
  };

  getAllEmployees(req: Request, res: Response) {
    return res.json(dataApi);
  }

  getEmployee(req: Request, res: Response) {
    const employee = this.data.employees.find(
      (emp) => emp.id === parseInt(req.params.id)
    );

    if (!employee) {
      return res
        .status(400)
        .json({ message: `Employee ID ${req.params.id} not found` });
    }

    return res.json(employee);
  }

  createEmployee(req: Request, res: Response) {
    const newEmployee = {
      id: this.data.employees?.length
        ? this.data.employees[this.data.employees.length - 1].id + 1
        : 1,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    };

    if (!newEmployee.firstname || !newEmployee.lastname) {
      return res
        .status(400)
        .json({ message: 'First and last names are required.' });
    }

    this.data.setEmployees([...this.data.employees, newEmployee]);

    return res.status(201).json(this.data.employees);
  }

  updateEmployee(req: Request, res: Response) {
    const employee = this.data.employees.find(
      (emp) => emp.id === parseInt(req.body.id)
    );

    if (!employee) {
      return res
        .status(400)
        .json({ message: `Employee ID ${req.body.id} not found` });
    }

    if (req.body.firstname) employee.firstname = req.body.firstname;

    if (req.body.lastname) employee.lastname = req.body.lastname;

    const filteredArray = this.data.employees.filter(
      (emp) => emp.id !== parseInt(req.body.id)
    );

    const unsortedArray = [...filteredArray, employee];

    this.data.setEmployees(
      unsortedArray.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
    );

    return res.json(this.data.employees);
  }

  deleteEmployee(req: Request, res: Response) {
    const employee = this.data.employees.find(
      (emp) => emp.id === parseInt(req.body.id)
    );

    if (!employee) {
      return res
        .status(400)
        .json({ message: `Employee ID ${req.body.id} not found` });
    }

    const filteredArray = this.data.employees.filter(
      (emp) => emp.id !== parseInt(req.body.id)
    );

    this.data.setEmployees([...filteredArray]);
    
    return res.json(this.data.employees);
  }
}
