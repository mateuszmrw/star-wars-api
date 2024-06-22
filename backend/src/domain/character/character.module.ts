import { Module } from '@nestjs/common';
import { CharacterService } from './services/character.service';
import { CharacterController } from './controllers/character.controller';
import { PrismaModule } from '@db/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CharacterController],
  providers: [CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
