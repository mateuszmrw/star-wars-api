import { PrismaService } from '@db/prisma.service';
import { CreateEpisodeDto } from '@dto/episode/create-episode.dto';
import { UpdateEpisodeDto } from '@dto/episode/update-episode.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Episode } from '@prisma/client';

@Injectable()
export class EpisodeService {
  constructor(private prisma: PrismaService) {}

  getAllEpisodes(params?: {
    take?: number;
    skip?: number;
  }): Promise<Episode[]> {
    return this.prisma.episode.findMany({
      ...params,
      include: { characters: true },
    });
  }

  async getEpisodeById(id: number): Promise<Episode | null> {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
    });
    if (!episode) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return episode;
  }

  async createEpisode(data: CreateEpisodeDto): Promise<Episode> {
    return this.prisma.episode.create({ data });
  }

  async updateEpisode(id: number, data: UpdateEpisodeDto): Promise<Episode> {
    return this.prisma.episode.update({
      where: { id },
      data,
    });
  }
  async deleteEpisode(id: number): Promise<Episode> {
    return this.prisma.episode.delete({ where: { id } });
  }
}
