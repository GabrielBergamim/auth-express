import { CookieOptions, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { UserModel } from '../model/schemas/Users';
import { RegistrationUserDTO } from './RegisterController';
import { IPayload } from '../middleware/verifyJWT';

const maxAge = 24 * 60 * 60 * 1000;

export class AuthController {
  async handleLogin(req: Request<{}, {}, RegistrationUserDTO>, res: Response) {
    const { user, pwd } = req.body;

    if (!user || !pwd) {
      return res
        .status(400)
        .json({ message: 'Username and password are required.' });
    }

    const foundUser = await UserModel.findOne({
      username: user,
    }).exec();

    if (!foundUser) {
      return res.sendStatus(401);
    }

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles).filter(Boolean);

      const payload = {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      } as IPayload;

      const accessToken = sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });

      const refreshToken = sign(
        { UserInfo: { username: foundUser.username } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      foundUser.refreshToken = refreshToken;
      await foundUser.save();

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge,
        sameSite: 'none',
        secure: true
      });

      return res.json({ accessToken, roles });
    } else {
      return res.sendStatus(401);
    }
  }

  async handleLogout(req: Request<{}, {}, RegistrationUserDTO>, res: Response) {
    const { jwt: token = null } = req.cookies;

    if (!token) {
      return res.sendStatus(204);
    }

    const foundUser = await UserModel.findOne({
      refreshToken: token,
    }).exec();

    const optionsCokie = { httpOnly: true, sameSite: 'none' } as CookieOptions;

    if (!foundUser) {
      res.clearCookie('jwt', optionsCokie);
      return res.sendStatus(204);
    }

    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie('jwt', optionsCokie);
    return res.sendStatus(204);
  }
}
