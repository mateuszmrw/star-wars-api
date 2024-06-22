import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '@dto/common/pagination.dto';
import { Planet } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PlanetController } from './planet.controller';
import { PlanetService } from '../services/planet.service';
import { CreatePlanetDto } from '@dto/planet/create-planet.dto';

describe('PlanetController', () => {
  let controller: PlanetController;
  let service: DeepMockProxy<PlanetService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanetController],
      providers: [
        { provide: PlanetService, useValue: mockDeep<PlanetService>() },
      ],
    }).compile();

    controller = module.get(PlanetController);
    service = module.get(PlanetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPlanets', () => {
    it('should return an array of planets', async () => {
      const result: Planet[] = [
        {
          id: 1,
          name: 'Earth',
        },
      ];
      service.getAllPlanets.mockResolvedValue(result);

      expect(await controller.getAllPlanets(new PaginationQueryDto())).toEqual(
        result,
      );
      expect(service.getAllPlanets).toHaveBeenCalled();
    });
  });

  describe('getPlanetById', () => {
    it('should return a planet by ID', async () => {
      const result: Planet = {
        id: 1,
        name: 'Earth',
      };
      service.getPlanetById.mockResolvedValue(result);

      expect(await controller.getPlanetById(1)).toEqual(result);
      expect(service.getPlanetById).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if planet is not found', async () => {
      service.getPlanetById.mockResolvedValue(null);

      await expect(controller.getPlanetById(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getPlanetById).toHaveBeenCalledWith(1);
    });
  });

  describe('createPlanet', () => {
    it('should create and return a new planet', async () => {
      const dto: CreatePlanetDto = {
        name: 'Earth',
      };
      const result: Planet = {
        id: 1,
        ...dto,
      };
      service.createPlanet.mockResolvedValue(result);

      expect(await controller.createPlanet(dto)).toEqual(result);
      expect(service.createPlanet).toHaveBeenCalledWith(dto);
    });
  });

  describe('deletePlanet', () => {
    it('should delete and return the deleted planet', async () => {
      const result: Planet = {
        id: 1,
        name: 'Earth',
      };
      service.deletePlanet.mockResolvedValue(result);

      expect(await controller.deletePlanet(1)).toEqual(result);
      expect(service.deletePlanet).toHaveBeenCalledWith(1);
    });
  });
});
