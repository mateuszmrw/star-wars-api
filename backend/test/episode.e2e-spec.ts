import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@db/prisma.service';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-client-exception.filter';
import { createEpisodeFactory } from '@factories/episode.factory';
import { CreateEpisodeDto } from '@dto/episode/create-episode.dto';

describe('EpisodeController (e2e)', () => {
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
    await prisma.episode.deleteMany({});
  });

  afterEach(async () => {
    await prisma.episode.deleteMany({});
  });

  afterAll(async () => {
    await prisma.episode.deleteMany({});
    await app.close();
  });

  describe('/episodes (GET)', () => {
    it('should return an empty array of episodes if no episodes', async () => {
      return request(app.getHttpServer())
        .get('/episodes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(0);
        });
    });

    it('should return an array of episodes if there are created episodes', async () => {
      const episodes = [createEpisodeFactory(), createEpisodeFactory()];
      await prisma.episode.createMany({
        data: episodes,
      });
      return request(app.getHttpServer())
        .get('/episodes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(2);
          for (const index in res.body) {
            const body = res.body[index];
            expect(body.name).toEqual(episodes[index].name);
          }
        });
    });

    it('should return an last entry based on the pagination', async () => {
      const episodes = [createEpisodeFactory(), createEpisodeFactory()];
      await prisma.episode.createMany({
        data: episodes,
      });
      return request(app.getHttpServer())
        .get('/episodes?take=1&skip=1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toEqual(1);
          expect(res.body[0].title).toEqual(episodes[1].title);
        });
    });
  });

  describe('/episodes/:id (GET)', () => {
    it('should return a episodes by ID', async () => {
      const episode = await prisma.episode.create({
        data: createEpisodeFactory(),
      });

      return request(app.getHttpServer())
        .get(`/episodes/${episode.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: episode.id,
            title: episode.title,
          });
        });
    });

    it('should return 404 if episode is not found', async () => {
      return request(app.getHttpServer()).get('/episodes/9999').expect(404);
    });
  });

  describe('/episodes (POST)', () => {
    it('should create and return a new episodes', async () => {
      const createEpisodeDto = createEpisodeFactory();

      return request(app.getHttpServer())
        .post('/episodes')
        .send(createEpisodeDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toEqual(createEpisodeDto.title);
        });
    });

    it('should return 409 if episode with title already exists', async () => {
      const createEpisodeDto = createEpisodeFactory();
      await prisma.episode.create({ data: createEpisodeDto });
      return request(app.getHttpServer())
        .post('/episodes')
        .send(createEpisodeDto)
        .expect(409);
    });

    it('should return validation error if name shorter than 3 characters', async () => {
      const createEpisodeDto = {
        title: 'L',
      };
      return request(app.getHttpServer())
        .post('/episodes')
        .send(createEpisodeDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'title must be longer than or equal to 3 characters',
          );
        });
    });

    it('should return validation error if name is longer than 255 characters', async () => {
      const createEpisodeDto: CreateEpisodeDto = {
        title: Array(267).join('L'),
      };
      return request(app.getHttpServer())
        .post('/episodes')
        .send(createEpisodeDto)
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(res.body.message.length).toEqual(1);
          expect(res.body.message[0]).toEqual(
            'title must be shorter than or equal to 255 characters',
          );
        });
    });
  });

  describe('/episodes/:id (DELETE)', () => {
    it('should delete and return the deleted episode', async () => {
      const episode = await prisma.episode.create({
        data: createEpisodeFactory(),
      });
      return request(app.getHttpServer())
        .delete(`/episodes/${episode.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: episode.id,
            title: episode.title,
          });
        });
    });

    it('should return 404 if episode with given id does not exists', async () => {
      return request(app.getHttpServer()).delete(`/episodes/999`).expect(404);
    });
  });
});
