import { Controller, Get, Post, Body, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMfa } from './entities/user-mfa.entity';
import * as crypto from 'crypto';

/** TOTP implementation without external dependency */
function generateSecret(): string {
    return crypto.randomBytes(20).toString('hex');
}

function generateTOTP(secret: string, timeStep = 30): string {
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStep);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(0, 0);
    buffer.writeUInt32BE(counter, 4);

    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'));
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0xf;
    const code = ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);
    return (code % 1000000).toString().padStart(6, '0');
}

function verifyTOTP(secret: string, token: string, window = 1): boolean {
    for (let i = -window; i <= window; i++) {
        const epoch = Math.floor(Date.now() / 1000) + (i * 30);
        const counter = Math.floor(epoch / 30);
        const buffer = Buffer.alloc(8);
        buffer.writeUInt32BE(0, 0);
        buffer.writeUInt32BE(counter, 4);

        const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'));
        hmac.update(buffer);
        const hash = hmac.digest();

        const offset = hash[hash.length - 1] & 0xf;
        const code = ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff);
        const computed = (code % 1000000).toString().padStart(6, '0');
        if (computed === token) return true;
    }
    return false;
}

function generateRecoveryCodes(count = 8): string[] {
    return Array.from({ length: count }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
    );
}

function secretToBase32(hex: string): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = Buffer.from(hex, 'hex');
    let bits = '';
    for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
    let base32 = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5).padEnd(5, '0');
        base32 += alphabet[parseInt(chunk, 2)];
    }
    return base32;
}

@Controller('auth/mfa')
@UseGuards(AuthGuard('jwt'))
export class MfaController {
    constructor(
        @InjectRepository(UserMfa)
        private mfaRepo: Repository<UserMfa>,
    ) { }

    /** Get MFA status for current user */
    @Get('status')
    async getStatus(@Request() req: any) {
        const mfa = await this.mfaRepo.findOne({ where: { userId: req.user.userId } });
        return { enabled: mfa?.enabled || false, verifiedAt: mfa?.verifiedAt };
    }

    /** Setup MFA — generates secret and QR code URI */
    @Post('setup')
    async setup(@Request() req: any) {
        const userId = req.user.userId;
        let mfa = await this.mfaRepo.findOne({ where: { userId } });

        const secret = generateSecret();
        const base32Secret = secretToBase32(secret);
        const recoveryCodes = generateRecoveryCodes();

        if (!mfa) {
            mfa = this.mfaRepo.create({ userId, secret, recoveryCodes });
        } else {
            mfa.secret = secret;
            mfa.recoveryCodes = recoveryCodes;
            mfa.enabled = false;
        }
        await this.mfaRepo.save(mfa);

        const otpauthUrl = `otpauth://totp/NextClin:${req.user.email || userId}?secret=${base32Secret}&issuer=NextClin&digits=6&period=30`;

        return {
            secret: base32Secret,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
            recoveryCodes,
        };
    }

    /** Verify TOTP code to activate MFA */
    @Post('verify')
    async verify(@Request() req: any, @Body() dto: { token: string }) {
        const mfa = await this.mfaRepo.findOne({ where: { userId: req.user.userId } });
        if (!mfa || !mfa.secret) throw new BadRequestException('MFA não configurado. Execute /auth/mfa/setup primeiro.');

        if (!verifyTOTP(mfa.secret, dto.token)) {
            throw new BadRequestException('Código inválido. Tente novamente.');
        }

        mfa.enabled = true;
        mfa.verifiedAt = new Date();
        await this.mfaRepo.save(mfa);

        return { success: true, message: 'MFA ativado com sucesso!' };
    }

    /** Validate TOTP on login (called after password check) */
    @Post('validate')
    async validate(@Request() req: any, @Body() dto: { token: string }) {
        const mfa = await this.mfaRepo.findOne({ where: { userId: req.user.userId } });
        if (!mfa || !mfa.enabled) return { valid: true, mfaRequired: false };

        // Check recovery code
        if (mfa.recoveryCodes?.includes(dto.token)) {
            mfa.recoveryCodes = mfa.recoveryCodes.filter(c => c !== dto.token);
            await this.mfaRepo.save(mfa);
            return { valid: true, recoveryCodeUsed: true, remainingCodes: mfa.recoveryCodes.length };
        }

        if (!verifyTOTP(mfa.secret, dto.token)) {
            throw new BadRequestException('Código MFA inválido.');
        }

        return { valid: true };
    }

    /** Disable MFA */
    @Post('disable')
    async disable(@Request() req: any, @Body() dto: { token: string }) {
        const mfa = await this.mfaRepo.findOne({ where: { userId: req.user.userId } });
        if (!mfa) throw new BadRequestException('MFA não encontrado.');

        if (!verifyTOTP(mfa.secret, dto.token)) {
            throw new BadRequestException('Código inválido para desativar MFA.');
        }

        mfa.enabled = false;
        await this.mfaRepo.save(mfa);
        return { success: true, message: 'MFA desativado.' };
    }
}
