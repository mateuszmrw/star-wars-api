import { Module } from '@nestjs/common';
import { PlanetService } from './services/planet.service';
import { PlanetController } from './controllers/planet.controller';
import { PrismaModule } from '@db/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanetController],
  providers: [PlanetService],
  exports: [PlanetService],
})
export class PlanetModule {}
