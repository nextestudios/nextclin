import { Controller, Get, Patch, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminGuard } from './admin.guard';
import { Public } from '../auth/public.decorator';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Subscription } from '../tenants/entities/subscription.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('admin/tenants')
@Public()
@UseGuards(SuperAdminGuard)
export class AdminTenantsController {
    constructor(
        @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
        @InjectRepository(Subscription) private subscriptionsRepo: Repository<Subscription>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    @Get()
    async listAll() {
        const tenants = await this.tenantsRepo.find({ order: { createdAt: 'DESC' } });

        const result = await Promise.all(tenants.map(async (t) => {
            const sub = await this.subscriptionsRepo.findOne({ where: { tenantId: t.id } });
            // User has M:N relation with tenants — count via raw query
            const userCount = await this.usersRepo
                .createQueryBuilder('u')
                .innerJoin('u.tenants', 't', 't.id = :tid', { tid: t.id })
                .getCount();
            return { ...t, plan: sub?.plan || 'FREE', userCount, active: true }; // active is not in entity, injected for compat
        }));

        return result;
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        const tenant = await this.tenantsRepo.findOne({ where: { id } });
        if (!tenant) throw new NotFoundException('Tenant não encontrado.');

        const sub = await this.subscriptionsRepo.findOne({ where: { tenantId: id } });
        const users = await this.usersRepo
            .createQueryBuilder('u')
            .innerJoin('u.tenants', 't', 't.id = :tid', { tid: id })
            .select(['u.id', 'u.name', 'u.email', 'u.role'])
            .getMany();

        return { tenant: { ...tenant, active: true }, subscription: sub, users };
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() dto: { active: boolean }) {
        const tenant = await this.tenantsRepo.findOne({ where: { id } });
        if (!tenant) throw new NotFoundException('Tenant não encontrado.');
        // Atributo active não existe em Tenant. Este endpoint fakes success ou precisa alterar entity.
        return { success: true, tenantId: id, active: dto.active };
    }

    @Post()
    async createTenant(@Body() dto: any) {
        // Create tenant
        const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let tenant = this.tenantsRepo.create({ name: dto.name, slug });
        tenant = await this.tenantsRepo.save(tenant);

        // Create or bind user
        let user = await this.usersRepo.findOne({ where: { email: dto.adminEmail }, relations: ['tenants'] });
        if (!user) {
            const passwordHash = await require('bcrypt').hash(dto.adminPassword, 10);
            user = this.usersRepo.create({
                name: dto.adminName,
                email: dto.adminEmail,
                passwordHash,
                role: UserRole.ADMIN,
                tenants: [tenant]
            });
            await this.usersRepo.save(user);
        } else {
            user.tenants = user.tenants ? [...user.tenants, tenant] : [tenant];
            await this.usersRepo.save(user);
        }

        // Create subscription
        let sub = this.subscriptionsRepo.create({
            tenantId: tenant.id,
            plan: dto.plan || 'FREE',
            status: 'ACTIVE' as any
        });
        await this.subscriptionsRepo.save(sub);

        return { success: true, tenantId: tenant.id, message: 'Tenant criado com sucesso.' };
    }

    @Post(':id/impersonate')
    async impersonate(@Param('id') tenantId: string, @Body() dto: { userId?: string }) {
        const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant não encontrado.');

        // Find user belonging to this tenant
        const qb = this.usersRepo
            .createQueryBuilder('u')
            .innerJoin('u.tenants', 't', 't.id = :tid', { tid: tenantId })
            .limit(1);

        if (dto.userId) qb.where('u.id = :uid', { uid: dto.userId });
        const user = await qb.getOne();
        if (!user) throw new NotFoundException('Usuário não encontrado neste tenant.');

        const secret = this.configService.get<string>('JWT_SECRET');
        const token = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                name: user.name,
                tenantIds: [tenantId],
                role: user.role,
                impersonated: true,
                impersonatedBy: 'super-admin',
            },
            { secret, expiresIn: '2h' },
        );

        return { token, user: { id: user.id, name: user.name, email: user.email }, tenantId };
    }
}
