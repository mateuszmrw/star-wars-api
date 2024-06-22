import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CharacterModule } from './domain/character/character.module';

@Module({
  imports: [PrismaModule, CharacterModule],
})
export class AppModule {}
