import { Test, TestingModule } from '@nestjs/testing';
import { CharacterController } from './character.controller';
import { CharacterService } from '../services/character.service';
import { CreateCharacterDto } from '@dto/character/create-character.dto';
import { UpdateCharacterDto } from '@dto/character/update-character.dto';
import { PaginationQueryDto } from '@dto/common/pagination.dto';
import { Character } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('CharacterController', () => {
  let controller: CharacterController;
  let service: DeepMockProxy<CharacterService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharacterController],
      providers: [
        { provide: CharacterService, useValue: mockDeep<CharacterService>() },
      ],
    }).compile();

    controller = module.get(CharacterController);
    service = module.get(CharacterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCharacters', () => {
    it('should return an array of characters', async () => {
      const result: Character[] = [
        {
          id: 1,
          name: 'Luke Skywalker',
          description: 'Jedi',
          createdAt: new Date(),
          updatedAt: new Date(),
          planetId: 1,
        },
      ];
      service.getAllCharacters.mockResolvedValue(result);

      expect(
        await controller.getAllCharacters(new PaginationQueryDto()),
      ).toEqual(result);
      expect(service.getAllCharacters).toHaveBeenCalled();
    });
  });

  describe('getCharacterById', () => {
    it('should return a character by ID', async () => {
      const result: Character = {
        id: 1,
        name: 'Luke Skywalker',
        description: 'Jedi',
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
      };
      service.getCharacterById.mockResolvedValue(result);

      expect(await controller.getCharacterById(1)).toEqual(result);
      expect(service.getCharacterById).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if character is not found', async () => {
      service.getCharacterById.mockResolvedValue(null);

      await expect(controller.getCharacterById(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getCharacterById).toHaveBeenCalledWith(1);
    });
  });

  describe('createCharacter', () => {
    it('should create and return a new character', async () => {
      const dto: CreateCharacterDto = {
        name: 'Luke Skywalker',
        description: 'Jedi',
      };
      const result: Character = {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
      };
      service.createCharacter.mockResolvedValue(result);

      expect(await controller.createCharacter(dto)).toEqual(result);
      expect(service.createCharacter).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateCharacter', () => {
    it('should update and return the updated character', async () => {
      const dto: UpdateCharacterDto = {
        name: 'Luke Skywalker',
        description: 'Jedi',
      };
      const result: Character = {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
      };
      service.updateCharacter.mockResolvedValue(result);

      expect(await controller.updateCharacter(1, dto)).toEqual(result);
      expect(service.updateCharacter).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete and return the deleted character', async () => {
      const result: Character = {
        id: 1,
        name: 'Luke Skywalker',
        description: 'Jedi',
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
      };
      service.deleteCharacter.mockResolvedValue(result);

      expect(await controller.deleteCharacter(1)).toEqual(result);
      expect(service.deleteCharacter).toHaveBeenCalledWith(1);
    });
  });
});
