import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomsDocument, CustomsFee } from './customs-document.entity';
import { CustomsService } from './customs.service';
import { CustomsController } from './customs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomsDocument, CustomsFee])],
  providers: [CustomsService],
  controllers: [CustomsController],
  exports: [TypeOrmModule],
})
export class CustomsModule {}
