import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
    @Public()
    @Get()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        };
    }

    @Public()
    @Get('readiness')
    readiness() {
        return { status: 'ready', timestamp: new Date().toISOString() };
    }
}
