import { CookieOptions, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import fsPromises from 'fs';
import path from 'path';

import dataApi from '../model/users.json';
import { RegistrationUserDTO, User } from './RegisterController';
import { IPayload } from '../middleware/verifyJWT';

const maxAge = 24 * 60 * 60 * 1000;

export class AuthController {
  data = {
    users: dataApi as User[],
    setUsers: function (data) {
      this.users = data;
    },
  };

  async handleLogin(req: Request<{}, {}, RegistrationUserDTO>, res: Response) {
    const { user, pwd } = req.body;

    if (!user || !pwd) {
      return res
        .status(400)
        .json({ message: 'Username and password are required.' });
    }

    const foundUser = this.data.users.find(({ username }) => username === user);

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

      const otherUsers = this.data.users.filter(
        ({ username }) => username !== user
      );

      const currentUser = { ...foundUser, refreshToken };

      this.data.setUsers([...otherUsers, currentUser]);

      fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(this.data.users),
        (err) => {
          return res.sendStatus(500);
        }
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

    const foundUser = this.data.users.find(
      ({ refreshToken }) => refreshToken === token
    );

    const optionsCokie = { httpOnly: true, sameSite: 'none' } as CookieOptions;

    if (!foundUser) {
      res.clearCookie('jwt', optionsCokie);
      return res.sendStatus(204);
    }

    const otherUsers = this.data.users.filter(
      ({ refreshToken }) => refreshToken !== token
    );

    const currentUser = { ...foundUser, refreshToken: '' };
    this.data.setUsers([...otherUsers, currentUser]);

    fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(this.data.users),
      (err) => {
        return res.sendStatus(500);
      }
    );

    res.clearCookie('jwt', optionsCokie);
    return res.sendStatus(204);
  }
}
