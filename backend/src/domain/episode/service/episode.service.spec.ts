import { Test, TestingModule } from '@nestjs/testing';
import { EpisodeService } from './episode.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Episode, PrismaClient } from '@prisma/client';
import { PrismaService } from '@db/prisma.service';

describe('EpisodeService', () => {
  let service: EpisodeService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodeService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get<EpisodeService>(EpisodeService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllEpisodes', () => {
    it('should return array of episodes', async () => {
      const episodes = [
        {
          id: 1,
          title: 'Episode 1',
        },
      ];
      prisma.episode.findMany.mockResolvedValue(episodes);

      expect(await service.getAllEpisodes({ skip: 0, take: 10 })).toEqual(
        episodes,
      );
      expect(prisma.episode.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          characters: true,
        },
      });
    });
  });

  describe('getEpisodeById', () => {
    it('should return episode by ID', async () => {
      const episode = {
        id: 1,
        title: 'Episode',
      };
      prisma.episode.findUnique.mockResolvedValue(episode);

      expect(await service.getEpisodeById(1)).toEqual(episode);
      expect(prisma.episode.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('createEpisode', () => {
    it('should create and return a new episode', async () => {
      const createEpisodeDto = {
        title: 'Episode',
      };
      const episode = {
        id: 1,
        ...createEpisodeDto,
      };
      prisma.episode.create.mockResolvedValue(episode);

      expect(await service.createEpisode(createEpisodeDto)).toEqual(episode);
      expect(prisma.episode.create).toHaveBeenCalledWith({
        data: createEpisodeDto,
      });
    });
  });

  describe('updateEpisode', () => {
    it('should update and return a updated episode', async () => {
      const updateEpisodeDto = {
        title: 'Episode 1',
      };
      const episode: Episode = {
        id: 1,
        ...updateEpisodeDto,
      };
      prisma.episode.update.mockResolvedValue(episode);

      expect(await service.updateEpisode(episode.id, updateEpisodeDto)).toEqual(
        episode,
      );
      expect(prisma.episode.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateEpisodeDto,
      });
    });
  });

  describe('deleteEpisode', () => {
    it('should delete and return the deleted episode', async () => {
      const episode = {
        id: 1,
        title: 'Episode',
      };
      prisma.episode.delete.mockResolvedValue(episode);
      expect(await service.deleteEpisode(1)).toEqual(episode);
      expect(prisma.episode.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
