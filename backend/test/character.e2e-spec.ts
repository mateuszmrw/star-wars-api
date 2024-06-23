import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@db/prisma.service';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-client-exception.filter';
import { createCharacterFactory } from '@factories/character.factory';
import { createPlanetFactory } from '@factories/planet.factory';
import { createEpisodeFactory } from '@factories/episode.factory';
import { CreateCharacterDto } from '@dto/character/create-character.dto';

describe('CharacterController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.character.deleteMany({});
    await prisma.planet.deleteMany({});
  });

  afterEach(async () => {
    await prisma.planet.deleteMany({});
    await prisma.character.deleteMany({});
  });

  afterAll(async () => {
    await prisma.character.deleteMany({});
    await prisma.planet.deleteMany({});
    await app.close();
  });

  describe('/characters (GET)', () => {
    it('should return an empty array of characters if no characters', async () => {
      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(0);
        });
    });

    it('should return an array of characters if there are created characters', async () => {
      const characters = [createCharacterFactory(), createCharacterFactory()];
      await prisma.character.createMany({
        data: characters,
      });
      return request(app.getHttpServer())
        .get('/characters')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(2);
          for (const index in res.body) {
            const body = res.body[index];
            expect(body.name).toEqual(characters[index].name);
            expect(body.description).toEqual(characters[index].description);
          }
        });
    });

    it('should return an last entry based on the pagination', async () => {
      const characters = [createCharacterFactory(), createCharacterFactory()];
      await prisma.character.createMany({
        data: characters,
      });
      return request(app.getHttpServer())
        .get('/characters?take=1&skip=1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(1);
          expect(res.body[0].name).toEqual(characters[1].name);
          expect(res.body[0].description).toEqual(characters[1].description);
        });
    });
  });

  describe('/characters/:id (GET)', () => {
    it('should return a character by ID', async () => {
      const planetData = createPlanetFactory();
      const planet = await prisma.planet.create({
        data: planetData,
      });

      const characterData = createCharacterFactory({
        planet: { connect: { id: planet.id } },
      });
      const character = await prisma.character.create({
        data: characterData,
      });

      return request(app.getHttpServer())
        .get(`/characters/${character.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: character.id,
            name: character.name,
            description: character.description,
            planet: planet,
          });
        });
    });

    it('should return 404 if character is not found', async () => {
      return request(app.getHttpServer()).get('/characters/9999').expect(404);
    });
  });

  describe('/characters (POST)', () => {
    it('should create and return a new character', async () => {
      const createCharacterDto = createCharacterFactory();

      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toEqual(createCharacterDto.name);
          expect(res.body.description).toEqual(createCharacterDto.description);
        });
    });

    it('should create and return a new character with planet and episode', async () => {
      const episodeDto = createEpisodeFactory();
      const episode = await prisma.episode.create({ data: episodeDto });
      const planetDto = createPlanetFactory();
      const planet = await prisma.planet.create({ data: planetDto });

      const createCharacterDto: CreateCharacterDto = {
        name: 'Luke Skywalker',
        description: 'He is a jedi',
        planetId: planet.id,
        episodeIds: [episode.id],
      };

      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toEqual(createCharacterDto.name);
          expect(res.body.description).toEqual(createCharacterDto.description);
          expect(res.body.planet).toEqual(planet);
          expect(res.body.episodes).toEqual([episode]);
        });
    });

    it('should return 409 if character with name already exists', async () => {
      const createCharacterDto = createCharacterFactory();
      await prisma.character.create({ data: createCharacterDto });
      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(409);
    });

    it('should return validation error if name shorter than 3 characters', async () => {
      const createCharacterDto = {
        name: 'L',
        description: 'Jedi',
      };
      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'name must be longer than or equal to 3 characters',
          );
        });
    });

    it('should return validation error if name is longer than 255 characters', async () => {
      const createCharacterDto = {
        name: Array(267).join('L'),
        description: 'Jedi',
      };
      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'name must be shorter than or equal to 255 characters',
          );
        });
    });

    it('should return validation error if description is longer than 255 characters', async () => {
      const createCharacterDto = {
        name: 'Like',
        description: Array(267).join('L'),
      };
      return request(app.getHttpServer())
        .post('/characters')
        .send(createCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'description must be shorter than or equal to 255 characters',
          );
        });
    });
  });

  describe('/characters/:id (PUT)', () => {
    it('should update and return the updated character', async () => {
      const planet = await prisma.planet.create({
        data: createPlanetFactory(),
      });
      const updatedPlanet = await prisma.planet.create({
        data: createPlanetFactory(),
      });

      const character = await prisma.character.create({
        data: createCharacterFactory({
          planet: { connect: { id: planet.id } },
        }),
      });

      const updateCharacterDto = {
        name: character.name,
        description: 'Updated Description',
        createdAt: character.createdAt,
        planetId: updatedPlanet.id,
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toEqual(updateCharacterDto.name);
          expect(res.body.description).toEqual(updateCharacterDto.description);
          expect(res.body.planet).toEqual(updatedPlanet);
          expect(res.body.description).not.toEqual(character.description);
        });
    });

    it('should return 409 if character with name already exists', async () => {
      const character = await prisma.character.create({
        data: {
          name: 'Luke Skywalker',
          description: 'Mechanic',
        },
      });

      await prisma.character.create({
        data: {
          name: 'Obi-Wan Kenobi',
          description: 'Jedi',
        },
      });

      const updateCharacterDto = {
        name: 'Obi-Wan Kenobi',
        description: 'Teacher',
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(409);
    });

    it('should return validation error if name shorter than 3 characters', async () => {
      const character = await prisma.character.create({
        data: {
          name: 'Luke Skywalker',
          description: 'Mechanic',
        },
      });

      const updateCharacterDto = {
        name: 'L',
        description: 'Jedi',
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'name must be longer than or equal to 3 characters',
          );
        });
    });

    it('should return validation error if name is longer than 255 characters', async () => {
      const character = await prisma.character.create({
        data: {
          name: 'Luke Skywalker',
          description: 'Mechanic',
        },
      });

      const updateCharacterDto = {
        name: Array(257).join('L'),
        description: 'Jedi',
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'name must be shorter than or equal to 255 characters',
          );
        });
    });

    it('should return validation error if description is longer than 255 characters', async () => {
      const character = await prisma.character.create({
        data: {
          name: 'Luke Skywalker',
          description: 'Mechanic',
        },
      });

      const updateCharacterDto = {
        name: 'Luke Skywalker',
        description: Array(257).join('L'),
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'description must be shorter than or equal to 255 characters',
          );
        });
    });

    it('should return validation error if planetId is a string', async () => {
      const character = await prisma.character.create({
        data: {
          name: 'Luke Skywalker',
          description: 'Mechanic',
        },
      });

      const updateCharacterDto = {
        name: 'Luke Skywalker',
        description: 'description',
        planetId: '1',
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(3);
          expect(res.body.message).toEqual([
            'planetId must be a positive number',
            'planetId must be an integer number',
            'planetId must be a number conforming to the specified constraints',
          ]);
        });
    });

    it('should return validation error if planetId is negative integer', async () => {
      const character = await prisma.character.create({
        data: {
          name: 'Luke Skywalker',
          description: 'Mechanic',
        },
      });

      const updateCharacterDto = {
        name: 'Luke Skywalker',
        description: 'description',
        planetId: -1,
      };

      return request(app.getHttpServer())
        .put(`/characters/${character.id}`)
        .send(updateCharacterDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'planetId must be a positive number',
          );
        });
    });
  });

  describe('/characters/:id (DELETE)', () => {
    it('should delete and return the deleted character', async () => {
      const character = await prisma.character.create({
        data: createCharacterFactory(),
      });
      return request(app.getHttpServer())
        .delete(`/characters/${character.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: character.id,
            name: character.name,
            description: character.description,
          });
        });
    });

    it('should return 404 if character with given id does not exists', async () => {
      return request(app.getHttpServer()).delete(`/characters/999`).expect(404);
    });
  });
});
