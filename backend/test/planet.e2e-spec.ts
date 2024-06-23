import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@db/prisma.service';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-client-exception.filter';
import { createPlanetFactory } from '@factories/planet.factory';
import { UpdatePlanetDto } from '@dto/planet/update-planet.dto';

describe('PlanetController (e2e)', () => {
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
    await prisma.planet.deleteMany({});
  });

  afterEach(async () => {
    await prisma.planet.deleteMany({});
  });

  afterAll(async () => {
    await prisma.planet.deleteMany({});
    await app.close();
  });

  describe('/planets (GET)', () => {
    it('should return an empty array of planets if no planets', async () => {
      return request(app.getHttpServer())
        .get('/planets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(0);
        });
    });

    it('should return an array of planets if there are created planets', async () => {
      const planets = [createPlanetFactory(), createPlanetFactory()];
      await prisma.planet.createMany({
        data: planets,
      });
      return request(app.getHttpServer())
        .get('/planets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(2);
          for (const index in res.body) {
            const body = res.body[index];
            expect(body.name).toEqual(planets[index].name);
          }
        });
    });

    it('should return an last entry based on the pagination', async () => {
      const planets = [createPlanetFactory(), createPlanetFactory()];
      await prisma.planet.createMany({
        data: planets,
      });
      return request(app.getHttpServer())
        .get('/planets?take=1&skip=1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(1);
          expect(res.body[0].name).toEqual(planets[1].name);
        });
    });
  });

  describe('/planets/:id (GET)', () => {
    it('should return a planets by ID', async () => {
      const planet = await prisma.planet.create({
        data: createPlanetFactory(),
      });

      return request(app.getHttpServer())
        .get(`/planets/${planet.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: planet.id,
            name: planet.name,
          });
        });
    });

    it('should return 404 if planet is not found', async () => {
      return request(app.getHttpServer()).get('/planets/9999').expect(404);
    });
  });

  describe('/planets (POST)', () => {
    it('should create and return a new planets', async () => {
      const createPlanetDto = createPlanetFactory();

      return request(app.getHttpServer())
        .post('/planets')
        .send(createPlanetDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toEqual(createPlanetDto.name);
        });
    });

    it('should return 409 if planet with name already exists', async () => {
      const createPlanetDto = createPlanetFactory();
      await prisma.planet.create({ data: createPlanetDto });
      return request(app.getHttpServer())
        .post('/planets')
        .send(createPlanetDto)
        .expect(409);
    });

    it('should return validation error if name shorter than 3 characters', async () => {
      const createPlanetDto = {
        name: 'L',
      };
      return request(app.getHttpServer())
        .post('/planets')
        .send(createPlanetDto)
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
      const createPlanetDto = {
        name: Array(267).join('L'),
      };
      return request(app.getHttpServer())
        .post('/planets')
        .send(createPlanetDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'name must be shorter than or equal to 255 characters',
          );
        });
    });
  });

  describe('/planets/:id (PUT)', () => {
    it('should update and return the updated planets', async () => {
      const planet = await prisma.planet.create({
        data: createPlanetFactory(),
      });

      const updatePlanetDto: UpdatePlanetDto = {
        name: 'Earth',
      };

      return request(app.getHttpServer())
        .put(`/planets/${planet.id}`)
        .send(updatePlanetDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toEqual(updatePlanetDto.name);
        });
    });

    it('should return 409 if planet with name already exists', async () => {
      const planet = await prisma.planet.create({
        data: createPlanetFactory(),
      });

      const planet2 = await prisma.planet.create({
        data: createPlanetFactory(),
      });

      const updatePlanetDto: UpdatePlanetDto = {
        name: planet2.name,
      };

      return request(app.getHttpServer())
        .put(`/planets/${planet.id}`)
        .send(updatePlanetDto)
        .expect(409);
    });
  });

  describe('/planets/:id (DELETE)', () => {
    it('should delete and return the deleted planet', async () => {
      const planet = await prisma.planet.create({
        data: createPlanetFactory(),
      });
      return request(app.getHttpServer())
        .delete(`/planets/${planet.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: planet.id,
            name: planet.name,
          });
        });
    });

    it('should return 404 if planet with given id does not exists', async () => {
      return request(app.getHttpServer()).delete(`/planets/999`).expect(404);
    });
  });
});
