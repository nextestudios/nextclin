import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { AccountReceivable } from './entities/account-receivable.entity';
import { AccountPayable } from './entities/account-payable.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccountReceivable, AccountPayable])],
    controllers: [FinancialController],
    providers: [FinancialService],
    exports: [FinancialService],
})
export class FinancialModule { }
