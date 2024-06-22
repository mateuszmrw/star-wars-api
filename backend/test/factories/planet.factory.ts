import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

export const createPlanetFactory = (
  overrides?: Partial<Prisma.PlanetCreateInput>,
): Prisma.PlanetCreateInput => {
  return {
    name: faker.location.city(),
    ...overrides,
  };
};
