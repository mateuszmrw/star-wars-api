import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CharacterService } from '../services/character.service';
import { Character } from '@prisma/client';
import { CreateCharacterDto } from '@dto/character/create-character.dto';
import { PaginationQueryDto } from '@dto/common/pagination.dto';
import { PaginationTransformPipe } from '@pipe/pagination-transform.pipe';
import { UpdateCharacterDto } from '@dto/character/update-character.dto';

@Controller('characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  getAllCharacters(
    @Query(new PaginationTransformPipe()) query?: PaginationQueryDto,
  ): Promise<Character[]> {
    return this.characterService.getAllCharacters(query);
  }

  @Get(':id')
  async getCharacterById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Character | null> {
    const character = await this.characterService.getCharacterById(id);
    if (!character) {
      throw new NotFoundException(`Character with it ${id} was not found`);
    }
    return character;
  }

  @Post()
  createCharacter(@Body() character: CreateCharacterDto): Promise<Character> {
    return this.characterService.createCharacter(character);
  }

  @Put(':id')
  async updateCharacter(
    @Param('id', ParseIntPipe) id: number,
    @Body() character: UpdateCharacterDto,
  ): Promise<Character> {
    return this.characterService.updateCharacter(id, character);
  }

  @Delete(':id')
  deleteCharacter(@Param('id', ParseIntPipe) id: number) {
    return this.characterService.deleteCharacter(id);
  }
}
