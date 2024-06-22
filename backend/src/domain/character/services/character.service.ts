import { CreateCharacterDto } from '@dto/character/create-character.dto';
import { UpdateCharacterDto } from '@dto/character/update-character.dto';
import { Injectable } from '@nestjs/common';
import { Character } from '@prisma/client';
import { PrismaService } from '@db/prisma.service';

@Injectable()
export class CharacterService {
  constructor(private prisma: PrismaService) {}

  async getAllCharacters(params?: {
    skip?: number;
    take?: number;
  }): Promise<Character[]> {
    return this.prisma.character.findMany(params);
  }

  async getCharacterById(id: number): Promise<Character | null> {
    return this.prisma.character.findUnique({ where: { id } });
  }

  async createCharacter(data: CreateCharacterDto): Promise<Character> {
    return this.prisma.character.create({ data });
  }

  async updateCharacter(
    id: number,
    data: UpdateCharacterDto,
  ): Promise<Character> {
    return this.prisma.character.update({ where: { id }, data });
  }

  async deleteCharacter(id: number): Promise<Character> {
    return this.prisma.character.delete({ where: { id } });
  }
}
