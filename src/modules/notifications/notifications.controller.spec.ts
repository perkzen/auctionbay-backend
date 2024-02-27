import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsModule } from './notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

describe('NotificationsController', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    controller: NotificationsController;

  const notificationsServiceMock = {
    findByUserId: jest.fn().mockResolvedValue([]),
    clearAll: jest.fn(),
  } as jest.Mocked<Pick<NotificationsService, 'findByUserId' | 'clearAll'>>;

  beforeEach(async () => {
    moduleRef = Test.createTestingModule({
      imports: [NotificationsModule, PrismaModule],
    })
      .overrideProvider(NotificationsService)
      .useValue(notificationsServiceMock);

    app = await moduleRef.compile();
    controller = app.get<NotificationsController>(NotificationsController);
  });

  afterAll(async () => {
    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should get all notifications for a user', async () => {
    const notifications = await controller.getNotifications('123');
    expect(notifications).toEqual([]);
  });
  it('should clear all notifications for a user', async () => {
    await controller.clearNotifications('123');
    expect(notificationsServiceMock.clearAll).toHaveBeenCalledWith('123');
  });
});
