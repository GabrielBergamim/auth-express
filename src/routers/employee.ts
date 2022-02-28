import { Router } from 'express';

import { EmployeesController } from '../controllers/EmployeesController';
import { ROLE_LIST } from '../config/rolesList';
import { verifyRoles } from '../middleware/verifyRoles';

const router = Router();

const controller = new EmployeesController();

router
  .route('/')
  .get((req, res) => controller.getAllEmployees(req, res))
  .post(verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor), (req, res) => controller.createEmployee(req, res));

router.route('/:id')
  .get(controller.getEmployee)
  .put(verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor), (req, res) => controller.updateEmployee(req, res))
  .delete(verifyRoles(ROLE_LIST.Admin), (req, res) => controller.deleteEmployee(req, res));

export { router as routerEmployees };
