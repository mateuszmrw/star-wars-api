import { Module } from '@nestjs/common';
import { EpisodeService } from './service/episode.service';
import { EpisodeController } from './controller/episode.controller';
import { PrismaModule } from '@db/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EpisodeService],
  controllers: [EpisodeController],
})
export class EpisodeModule {}
