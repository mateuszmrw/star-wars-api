import { PaginationQueryDto } from '@dto/common/pagination.dto';
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
import { PaginationTransformPipe } from '@pipe/pagination-transform.pipe';
import { Episode } from '@prisma/client';
import { EpisodeService } from '../service/episode.service';
import { CreateEpisodeDto } from '@dto/episode/create-episode.dto';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  getAllEpisodes(
    @Query(new PaginationTransformPipe()) query?: PaginationQueryDto,
  ): Promise<Episode[]> {
    return this.episodeService.getAllEpisodes(query);
  }

  @Get(':id')
  async getEpisodeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Episode | null> {
    const episode = await this.episodeService.getEpisodeById(id);
    if (!episode) {
      throw new NotFoundException(`Episode with ${id} was not found`);
    }
    return episode;
  }

  @Post()
  createEpisode(@Body() episode: CreateEpisodeDto): Promise<Episode> {
    return this.episodeService.createEpisode(episode);
  }

  @Delete(':id')
  deleteEpisode(@Param('id', ParseIntPipe) id: number) {
    return this.episodeService.deleteEpisode(id);
  }
}
