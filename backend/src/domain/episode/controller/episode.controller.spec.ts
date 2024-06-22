import { Test, TestingModule } from '@nestjs/testing';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from '../service/episode.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Episode } from '@prisma/client';
import { PaginationQueryDto } from '@dto/common/pagination.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateEpisodeDto } from '@dto/episode/create-episode.dto';

describe('EpisodeController', () => {
  let controller: EpisodeController;
  let service: DeepMockProxy<EpisodeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpisodeController],
      providers: [
        {
          provide: EpisodeService,
          useValue: mockDeep<EpisodeService>(),
        },
      ],
    }).compile();

    controller = module.get<EpisodeController>(EpisodeController);
    service = module.get(EpisodeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllEpisodes', () => {
    it('should return an array of episodes', async () => {
      const result: Episode[] = [{ id: 1, title: 'Episode' }];
      service.getAllEpisodes.mockResolvedValue(result);

      expect(await controller.getAllEpisodes(new PaginationQueryDto())).toEqual(
        result,
      );
      expect(service.getAllEpisodes).toHaveBeenCalled();
    });
  });

  describe('getEpisodeById', () => {
    it('should return an episode by ID', async () => {
      const result: Episode = {
        id: 1,
        title: 'Episode',
      };
      service.getEpisodeById.mockResolvedValue(result);

      expect(await controller.getEpisodeById(1)).toEqual(result);
      expect(service.getEpisodeById).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if episode is not found', async () => {
      service.getEpisodeById.mockResolvedValue(null);

      await expect(controller.getEpisodeById(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getEpisodeById).toHaveBeenCalledWith(1);
    });
  });

  describe('createEpisode', () => {
    it('should create and return a new episode', async () => {
      const dto: CreateEpisodeDto = {
        title: 'Episode',
      };
      const result: Episode = {
        id: 1,
        ...dto,
      };

      service.createEpisode.mockResolvedValue(result);
      expect(await controller.createEpisode(dto)).toEqual(result);
      expect(service.createEpisode).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteEpisode', () => {
    it('should delete and return the deleted episode', async () => {
      const result: Episode = {
        id: 1,
        title: 'Episode',
      };

      service.deleteEpisode.mockResolvedValue(result);

      expect(await controller.deleteEpisode(1)).toEqual(result);
      expect(service.deleteEpisode).toHaveBeenCalledWith(1);
    });
  });
});
