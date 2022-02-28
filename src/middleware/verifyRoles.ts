import { NextFunction, Request, Response } from 'express';

export function verifyRoles(...allowedRoles: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if(!req?.roles) {
      return res.sendStatus(401);
    }

    const rolesArray = [...allowedRoles];

    const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);

    console.log(req.roles)

    if(!result) {
      return res.sendStatus(401);
    }

    return next();
  };
}
