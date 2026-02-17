import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = this.usersRepository.create({
            ...createUserDto,
            passwordHash,
        });
        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['tenants'],
        });
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['tenants'],
        });
    }
}
