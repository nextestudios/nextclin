import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockMovement } from './entities/stock-movement.entity';
import { Batch } from '../vaccines/entities/batch.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StockMovement, Batch])],
    controllers: [StockController],
    providers: [StockService],
    exports: [StockService],
})
export class StockModule { }
