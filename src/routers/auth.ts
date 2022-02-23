import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RefreshTokenController } from '../controllers/RefreshTokenController';

const router = Router();

const controller = new AuthController();
const controllerRefresh = new RefreshTokenController();

router.post('/', (req, res) => controller.handleLogin(req, res));
router.get('/logout', (req, res) => controller.handleLogout(req, res));
router.get('/refresh', (req, res) => controllerRefresh.handleRefreshToken(req, res));
  
export { router as routerAuth };
