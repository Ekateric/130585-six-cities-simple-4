import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import express, { Express } from 'express';

import { LoggerInterface } from '@core/logger/logger.interface.js';
import { ConfigInterface } from '@core/config/config.interface.js';
import { DBClientInterface } from '@core/db-client/db-client.interface.js';
import { ControllerInterface } from '@core/controller/controller.interface.js';
import { ExceptionFilterInterface } from '@core/exception-filter/exception-filter.interface.js';
import { RestSchema } from '@core/config/rest.schema.js';
import { AppComponent } from '@appTypes/app-component.enum.js';
import { getMongoURI } from '@utils/index.js';

@injectable()
export default class RESTApplication {
  private expressApp: Express;

  constructor(
    @inject(AppComponent.LoggerInterface)private readonly logger: LoggerInterface,
    @inject(AppComponent.ConfigInterface)private readonly config: ConfigInterface<RestSchema>,
    @inject(AppComponent.DBClientInterface) private readonly dbClient: DBClientInterface,
    @inject(AppComponent.CityController) private readonly cityController: ControllerInterface,
    @inject(AppComponent.UserController) private readonly userController: ControllerInterface,
    @inject(AppComponent.RentController) private readonly rentController: ControllerInterface,
    @inject(AppComponent.CommentController) private readonly commentController: ControllerInterface,
    @inject(AppComponent.ExceptionFilterInterface) private readonly exceptionFilter: ExceptionFilterInterface,
  ) {
    this.expressApp = express();
  }

  private async initDB() {
    this.logger.info('Инициализация БД…');

    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    await this.dbClient.connect(mongoUri);
    this.logger.info('Инициализация БД завершена!');
  }

  private async initMiddlewares() {
    this.logger.info('Инициализация глобальных middleware…');
    this.expressApp.use(express.json());
    this.expressApp.use('/upload', express.static(this.config.get('UPLOAD_DIRECTORY')));
    this.logger.info('Инициализация глобальных middleware завершена!');
  }

  private async initRoutes() {
    this.logger.info('Инициализация маршрутов...');
    this.expressApp.use('/cities', this.cityController.router);
    this.expressApp.use('/users', this.userController.router);
    this.expressApp.use('/rents', this.rentController.router);
    this.expressApp.use('/comments', this.commentController.router);
    this.logger.info('Инициализация маршрутов завершена!');
  }

  private async initExceptionFilters() {
    this.logger.info('Инициализация Exception filters...');
    this.expressApp.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.logger.info('Инициализация Exception filters завершена!');
  }

  private async initServer() {
    this.logger.info('Инициализация сервера…');

    const port = this.config.get('PORT');

    this.expressApp.listen(port);
    this.logger.info(`🚀 Cервер запущен на http://localhost:${port}!`);
  }

  public async init() {
    this.logger.info('Инициализация приложения…');

    await this.initDB();
    await this.initMiddlewares();
    await this.initRoutes();
    await this.initExceptionFilters();
    await this.initServer();
  }
}
