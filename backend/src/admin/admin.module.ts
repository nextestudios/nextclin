import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AdminUser } from './entities/admin-user.entity';
import { LandingPageConfig } from './entities/landing-page-config.entity';
import { AdminAuthController } from './admin-auth.controller';
import { AdminTenantsController } from './admin-tenants.controller';
import { AdminPlansController } from './admin-plans.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminLandingCmsController } from './admin-landing-cms.controller';
import { AdminBroadcastsController } from './admin-broadcasts.controller';
import { SuperAdminGuard } from './admin.guard';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Subscription } from '../tenants/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { MessageLog } from '../notifications/entities/message-log.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([
            AdminUser, LandingPageConfig, Tenant, Subscription, User, Attendance, MessageLog
        ]),
        JwtModule.register({}),
    ],
    controllers: [
        AdminAuthController,
        AdminTenantsController,
        AdminPlansController,
        AdminAnalyticsController,
        AdminLandingCmsController,
        AdminBroadcastsController,
    ],
    providers: [SuperAdminGuard],
    exports: [SuperAdminGuard],
})
export class AdminModule { }
