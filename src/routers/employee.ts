import { Router } from 'express';
import { EmployeesController } from '../controllers/EmployeesController';

const router = Router();

const controller = new EmployeesController();

router.route('/')
  .get((req, res) => controller.getAllEmployees(req, res))
  .post((req, res) => controller.createEmployee(req, res))
  .put((req, res) => controller.updateEmployee(req, res))
  .delete((req, res) => controller.deleteEmployee(req, res));

router.route('/:id').get(controller.getEmployee);

export { router as routerEmployees };
