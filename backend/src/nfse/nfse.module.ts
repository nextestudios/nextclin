import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfseService } from './nfse.service';
import { NfseController } from './nfse.controller';
import { Nfse } from './entities/nfse.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Nfse])],
    controllers: [NfseController],
    providers: [NfseService],
    exports: [NfseService],
})
export class NfseModule { }
