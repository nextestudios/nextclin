import { Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NfseService } from './nfse.service';

@Controller('nfse')
@UseGuards(AuthGuard('jwt'))
export class NfseController {
    constructor(private readonly nfseService: NfseService) { }

    @Post(':accountReceivableId/:patientId')
    issue(
        @Request() req: any,
        @Param('accountReceivableId') arId: string,
        @Param('patientId') patientId: string,
    ) {
        return this.nfseService.issueNfse(req.user.tenantIds?.[0], arId, patientId);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.nfseService.findAll(req.user.tenantIds?.[0]);
    }

    @Post(':id/retry')
    retry(@Request() req: any, @Param('id') id: string) {
        return this.nfseService.retry(req.user.tenantIds?.[0], id);
    }
}
