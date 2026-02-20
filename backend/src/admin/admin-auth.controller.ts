import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './entities/admin-user.entity';
import { SuperAdminGuard } from './admin.guard';
import { Public } from '../auth/public.decorator';

@Controller('admin/auth')
export class AdminAuthController {
    constructor(
        @InjectRepository(AdminUser)
        private adminUsersRepo: Repository<AdminUser>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    @Public()
    @Post('login')
    async login(@Body() dto: { email: string; password: string }) {
        const user = await this.adminUsersRepo.findOne({ where: { email: dto.email, active: true } });
        if (!user) throw new UnauthorizedException('Credenciais inválidas.');

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) throw new UnauthorizedException('Credenciais inválidas.');

        // Update lastLoginAt
        user.lastLoginAt = new Date();
        await this.adminUsersRepo.save(user);

        const secret = this.configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret-change-in-prod';
        const token = this.jwtService.sign(
            { sub: user.id, email: user.email, name: user.name, role: user.role, iss: 'nextclin-admin' },
            { secret, expiresIn: '8h' },
        );

        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }

    @UseGuards(SuperAdminGuard)
    @Get('me')
    getMe(@Request() req: any) {
        return req.adminUser;
    }

    /** Bootstrap: create first super admin (only works when table is empty) */
    @Public()
    @Post('setup')
    async setup(@Body() dto: { name: string; email: string; password: string; secret: string }) {
        const setupSecret = this.configService.get<string>('ADMIN_SETUP_SECRET') || 'setup-secret';
        if (dto.secret !== setupSecret) throw new UnauthorizedException('Secret inválido.');

        const count = await this.adminUsersRepo.count();
        if (count > 0) throw new UnauthorizedException('Setup já foi realizado.');

        const hashed = await bcrypt.hash(dto.password, 12);
        const admin = this.adminUsersRepo.create({
            name: dto.name,
            email: dto.email,
            password: hashed,
            role: 'SUPER_ADMIN' as any,
        });
        await this.adminUsersRepo.save(admin);
        return { success: true, message: 'Super Admin criado com sucesso.' };
    }
}
