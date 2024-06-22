import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Planet } from '@prisma/client';
import { PaginationQueryDto } from '@dto/common/pagination.dto';
import { PaginationTransformPipe } from '@pipe/pagination-transform.pipe';
import { PlanetService } from '../services/planet.service';
import { CreatePlanetDto } from '@dto/planet/create-planet.dto';

@Controller('planets')
export class PlanetController {
  constructor(private readonly planetService: PlanetService) {}

  @Get()
  getAllPlanets(
    @Query(new PaginationTransformPipe()) query?: PaginationQueryDto,
  ): Promise<Planet[]> {
    return this.planetService.getAllPlanets(query);
  }

  @Get(':id')
  async getPlanetById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Planet | null> {
    const planet = await this.planetService.getPlanetById(id);
    if (!planet) {
      throw new NotFoundException(`Planet with it ${id} was not found`);
    }
    return planet;
  }

  @Post()
  createPlanet(@Body() planet: CreatePlanetDto): Promise<Planet> {
    return this.planetService.createPlanet(planet);
  }

  @Delete(':id')
  deletePlanet(@Param('id', ParseIntPipe) id: number) {
    return this.planetService.deletePlanet(id);
  }
}
