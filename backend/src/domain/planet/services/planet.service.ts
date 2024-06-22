import { Injectable } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service';
import { Planet } from '@prisma/client';
import { CreatePlanetDto } from '@dto/planet/create-planet.dto';

@Injectable()
export class PlanetService {
  constructor(private prisma: PrismaService) {}

  async createPlanet(data: CreatePlanetDto): Promise<Planet> {
    return this.prisma.planet.create({ data });
  }

  async getAllPlanets(params?: {
    skip?: number;
    take?: number;
  }): Promise<Planet[]> {
    return this.prisma.planet.findMany(params);
  }

  async getPlanetById(id: number): Promise<Planet | null> {
    return this.prisma.planet.findUnique({ where: { id } });
  }

  async deletePlanet(id: number): Promise<Planet> {
    return this.prisma.planet.delete({ where: { id } });
  }
}
