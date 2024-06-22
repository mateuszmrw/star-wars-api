import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CharacterModule } from './domain/character/character.module';
import { PlanetModule } from '@domain/planet/planet.module';
import { EpisodeModule } from '@domain/episode/episode.module';

@Module({
  imports: [PrismaModule, CharacterModule, PlanetModule, EpisodeModule],
})
export class AppModule {}
