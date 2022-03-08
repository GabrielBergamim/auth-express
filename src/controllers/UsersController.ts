import { Request, Response } from 'express';

import { UserModel } from '../model/schemas/Users';

export class UsersController {
  async handleGetUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.find().exec();
      return res.status(201).json(users);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}
