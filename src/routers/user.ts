import { Router } from 'express';
import { ROLE_LIST } from '../config/rolesList';
import { UsersController } from '../controllers/UsersController';
import { verifyRoles } from '../middleware/verifyRoles';

const router = Router();

const controller = new UsersController();

router.route('/')
  .get(verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor), (req, res) =>
    controller.handleGetUsers(req, res)
  );

export { router as routerUsers };
