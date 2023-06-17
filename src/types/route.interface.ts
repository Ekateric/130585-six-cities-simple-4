import { NextFunction, Request, Response } from 'express';

import { HttpMethod } from '@appTypes/http-method.enum.js';
import { MiddlewareInterface } from '@core/middleware/middleware.interface.js';

export interface RouteInterface {
  path: string;
  method: HttpMethod;
  handler: (req: Request, res: Response, next: NextFunction) => void;
  middlewares?: MiddlewareInterface[];
}
