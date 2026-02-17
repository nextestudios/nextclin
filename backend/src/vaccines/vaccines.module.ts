import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinesService } from './vaccines.service';
import { VaccinesController } from './vaccines.controller';
import { Vaccine } from './entities/vaccine.entity';
import { Batch } from './entities/batch.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vaccine, Batch])],
    controllers: [VaccinesController],
    providers: [VaccinesService],
    exports: [VaccinesService],
})
export class VaccinesModule { }
