import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: User, unitId?: string) {
        const tenantIds = user.tenants ? user.tenants.map(t => t.id) : [];

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            tenantIds,
            unitId: unitId || null,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenants: user.tenants,
                selectedUnitId: unitId || null,
            },
        };
    }
}
