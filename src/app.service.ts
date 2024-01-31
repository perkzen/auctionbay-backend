import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
    healthCheck() {
        return {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }
}
