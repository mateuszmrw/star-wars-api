import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

export const createEpisodeFactory = (
  overrides?: Partial<Prisma.EpisodeCreateInput>,
): Prisma.EpisodeCreateInput => {
  return {
    title: faker.company.buzzNoun(),
    ...overrides,
  };
};
