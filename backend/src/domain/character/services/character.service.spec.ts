import { Test, TestingModule } from '@nestjs/testing';
import { CharacterService } from './character.service';
import { PrismaService } from '@db/prisma.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('CharacterService', () => {
  let service: CharacterService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(CharacterService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCharacters', () => {
    it('should return an array of characters', async () => {
      const characters = [
        {
          id: 1,
          name: 'Luke Skywalker',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          planetId: 1,
        },
      ];
      prisma.character.findMany.mockResolvedValue(characters);

      expect(await service.getAllCharacters({ skip: 0, take: 10 })).toEqual(
        characters,
      );
      expect(prisma.character.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          planet: true,
        },
      });
    });
  });

  describe('getCharacterById', () => {
    it('should return a character by ID', async () => {
      const character = {
        id: 1,
        name: 'Luke Skywalker',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
      };
      prisma.character.findUnique.mockResolvedValue(character);

      expect(await service.getCharacterById(1)).toEqual(character);
      expect(prisma.character.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          planet: true,
        },
      });
    });
  });

  describe('createCharacter', () => {
    it('should create and return a new character', async () => {
      const createCharacterDto = {
        name: 'Luke Skywalker',
        description: "That's him",
      };
      const character = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
        ...createCharacterDto,
      };
      prisma.character.create.mockResolvedValue(character);

      expect(await service.createCharacter(createCharacterDto)).toEqual(
        character,
      );
      expect(prisma.character.create).toHaveBeenCalledWith({
        data: createCharacterDto,
        include: {
          planet: true,
        },
      });
    });
  });

  describe('updateCharacter', () => {
    it('should update and return the updated character', async () => {
      const updateCharacterDto = {
        name: 'Luke Skywalker',
        description: "That's the real",
      };
      const character = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
        ...updateCharacterDto,
      };
      prisma.character.update.mockResolvedValue(character);

      expect(await service.updateCharacter(1, updateCharacterDto)).toEqual(
        character,
      );
      expect(prisma.character.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateCharacterDto,
        include: {
          planet: true,
        },
      });
    });
  });

  describe('deleteCharacter', () => {
    it('should delete and return the deleted character', async () => {
      const character = {
        id: 1,
        name: 'Luke Skywalker',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        planetId: 1,
      };
      prisma.character.delete.mockResolvedValue(character);

      expect(await service.deleteCharacter(1)).toEqual(character);
      expect(prisma.character.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          planet: true,
        },
      });
    });
  });
});
