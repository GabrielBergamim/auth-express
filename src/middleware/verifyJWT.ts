import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export interface IPayload {
  UserInfo: {
    username: string;
    roles: number[];
  };
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader =
    req.headers.authorization || req.headers.Authorization?.toString();

  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const {
      UserInfo: { username, roles },
    } = verify(token, process.env.ACCESS_TOKEN_SECRET) as IPayload;

    req.user = username;
    req.roles = roles;
    return next();
  } catch (err) {
    return res.status(403).json({ errorCode: 'token.expired' });
  }
}
