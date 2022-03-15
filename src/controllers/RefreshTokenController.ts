import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { IPayload } from '../middleware/verifyJWT';
import { UserModel } from '../model/schemas/Users';

export class RefreshTokenController {
  async handleRefreshToken(req: Request, res: Response) {
    const { jwt: refreshToken = null } = req.cookies;

    if (!refreshToken) {
      return res.sendStatus(401);
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none' });

    const foundUser = await UserModel.findOne({
      refreshToken,
    }).exec();

    if (!foundUser) {
      try {
        const {
          UserInfo: { username },
        } = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as IPayload;

        const hackedUser = await UserModel.findOne({ username }).exec();
        hackedUser.refreshToken = [];

        await hackedUser.save();
      } finally {
        return res.sendStatus(403);
      }
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    );

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
        expiresIn: '10s',
      });

      const newRefreshToken = sign(
        { UserInfo: { username: foundUser.username } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await foundUser.save();

      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true
      });

      return res.json({ accessToken, roles });
    } catch (err) {
      foundUser.refreshToken = [...newRefreshTokenArray];
      await foundUser.save();
      return res.status(403).json({ errorCode: 'token.expired' });
    }
  }
}
