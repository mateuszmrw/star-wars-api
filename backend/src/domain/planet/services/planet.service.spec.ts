import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@db/prisma.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PlanetService } from './planet.service';

describe('PlanetService', () => {
  let service: PlanetService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanetService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(PlanetService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPlanets', () => {
    it('should return an array of planet', async () => {
      const planets = [
        {
          id: 1,
          name: 'planets',
        },
      ];
      prisma.planet.findMany.mockResolvedValue(planets);

      expect(await service.getAllPlanets({ skip: 0, take: 10 })).toEqual(
        planets,
      );
      expect(prisma.planet.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });

  describe('getPlanetById', () => {
    it('should return a planet by ID', async () => {
      const planet = {
        id: 1,
        name: 'planets',
      };
      prisma.planet.findUnique.mockResolvedValue(planet);

      expect(await service.getPlanetById(1)).toEqual(planet);
      expect(prisma.planet.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('createPlanet', () => {
    it('should create and return a new planet', async () => {
      const createPlanetDto = {
        name: 'Earth',
      };
      const planet = {
        id: 1,
        ...createPlanetDto,
      };
      prisma.planet.create.mockResolvedValue(planet);

      expect(await service.createPlanet(createPlanetDto)).toEqual(planet);
      expect(prisma.planet.create).toHaveBeenCalledWith({
        data: createPlanetDto,
      });
    });
  });

  describe('deletePlanet', () => {
    it('should delete and return the deleted planet', async () => {
      const planet = {
        id: 1,
        name: 'Earth',
      };
      prisma.planet.delete.mockResolvedValue(planet);

      expect(await service.deletePlanet(1)).toEqual(planet);
      expect(prisma.planet.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
