import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController';

const router = Router();

const controller = new RegisterController();

router.route('/')
  .post((req, res) => controller.handleNewUser(req, res))
  .get((req, res) => controller.handleGetUsers(req, res));
  
export { router as routerRegister };
