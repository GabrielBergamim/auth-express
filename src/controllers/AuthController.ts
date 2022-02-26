import { CookieOptions, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

import { UserModel } from '../model/schemas/Users';
import { RegistrationUserDTO, User } from './RegisterController';
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

    const foundUser = (await UserModel.findOne({
      username: user,
    }).exec()) as User;

    if (!foundUser) {
      return res.sendStatus(401);
    }

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {
      const roles = Object.values(foundUser.roles);
      const payload = {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      } as IPayload;

      const accesToken = sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30s',
      });

      const refreshToken = sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      await UserModel.updateOne(
        { username: foundUser.username },
        { $set: { refreshToken } }
      );

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge,
        sameSite: 'none',
      });

      return res.json({ accesToken });
    } else {
      return res.sendStatus(401);
    }
  }

  async handleLogout(req: Request<{}, {}, RegistrationUserDTO>, res: Response) {
    const { jwt: token = null } = req.cookies;

    if (!token) {
      return res.sendStatus(204);
    }

    const foundUser = (await UserModel.findOne({
      refreshToken: token,
    }).exec()) as User;

    const optionsCokie = { httpOnly: true, sameSite: 'none' } as CookieOptions;

    if (!foundUser) {
      res.clearCookie('jwt', optionsCokie);
      return res.sendStatus(204);
    }

    await UserModel.updateOne(
      { username: foundUser.username },
      { $set: { refreshToken: null } }
    );

    res.clearCookie('jwt', optionsCokie);
    return res.sendStatus(204);
  }
}
