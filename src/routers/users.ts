import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController';

const router = Router();

const controller = new RegisterController();

router.post('/', (req, res) => controller.handleNewUser(req, res));
  
export { router as routerUsers };
