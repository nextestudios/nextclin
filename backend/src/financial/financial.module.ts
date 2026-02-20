import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { PriceTableController } from './price-table.controller';
import { AccountReceivable } from './entities/account-receivable.entity';
import { AccountPayable } from './entities/account-payable.entity';
import { PriceTable } from './entities/price-table.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AccountReceivable, AccountPayable, PriceTable])],
    controllers: [FinancialController, PriceTableController],
    providers: [FinancialService],
    exports: [FinancialService],
})
export class FinancialModule { }
