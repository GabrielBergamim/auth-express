import { Request, Response } from 'express';
import { verify, sign } from 'jsonwebtoken';
import dotenv from 'dotenv';

import dataApi from '../model/users.json';
import { User } from './RegisterController';
import { IPayload } from '../middleware/verifyJWT';

dotenv.config();

export class RefreshTokenController {
  data = {
    users: dataApi as User[],
    setUsers: function (data) {
      this.users = data;
    },
  };

  handleRefreshToken(req: Request, res: Response) {
    const { jwt: token = null } = req.cookies;

    console.log(req.cookies);

    if (!token) {
      return res.sendStatus(401);
    }

    const foundUser = this.data.users.find(
      ({ refreshToken }) => refreshToken === token
    );

    if (!foundUser) {
      return res.sendStatus(403);
    }

    try {
      const { username } = verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
      ) as IPayload;

      if (username !== foundUser.username) {
        return res.sendStatus(403);
      }

      const accesToken = sign(
        {
          username: foundUser.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
      );

      return res.json({accesToken});
    } catch (err) {
      return res.status(403).json({ errorCode: 'token.expired' });
    }
  }
}
