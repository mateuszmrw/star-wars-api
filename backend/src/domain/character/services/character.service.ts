import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service';
import { Character } from '@prisma/client';
import { CreateCharacterDto } from '@dto/character/create-character.dto';
import { UpdateCharacterDto } from '@dto/character/update-character.dto';

@Injectable()
export class CharacterService {
  constructor(private prisma: PrismaService) {}

  async getAllCharacters(params?: {
    skip?: number;
    take?: number;
  }): Promise<Character[]> {
    return this.prisma.character.findMany({
      ...params,
      include: {
        planet: true,
      },
    });
  }

  async getCharacterById(id: number): Promise<Character | null> {
    const character = await this.prisma.character.findUnique({
      where: { id },
      include: {
        planet: true,
      },
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return character;
  }

  async createCharacter(data: CreateCharacterDto): Promise<Character> {
    return this.prisma.character.create({
      data,
      include: {
        planet: true,
      },
    });
  }

  async updateCharacter(
    id: number,
    data: UpdateCharacterDto,
  ): Promise<Character> {
    return this.prisma.character.update({
      where: { id },
      data,
      include: {
        planet: true,
      },
    });
  }

  async deleteCharacter(id: number): Promise<Character> {
    return this.prisma.character.delete({
      where: { id },
      include: {
        planet: true,
      },
    });
  }
}
