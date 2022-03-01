import { Request, Response } from 'express';
import { verify, sign } from 'jsonwebtoken';

import { UserModel } from '../model/schemas/Users';
import { IPayload } from '../middleware/verifyJWT';

export class RefreshTokenController {
  async handleRefreshToken(req: Request, res: Response) {
    const { jwt: refreshToken = null } = req.cookies;

    if (!refreshToken) {
      return res.sendStatus(401);
    }

    const foundUser = await UserModel.findOne({
      refreshToken,
    }).exec();

    if (!foundUser) {
      return res.sendStatus(403);
    }

    try {
      const {
        UserInfo: { username },
      } = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as IPayload;

      if (username !== foundUser.username) {
        return res.sendStatus(403);
      }

      const roles = Object.values(foundUser.roles);

      const payload = {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      } as IPayload;

      const accessToken = sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      });

      return res.json({ accessToken });
    } catch (err) {
      return res.status(403).json({ errorCode: 'token.expired' });
    }
  }
}
