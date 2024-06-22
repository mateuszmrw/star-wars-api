import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

export const createCharacterFactory = (
  overrides?: Partial<Prisma.CharacterCreateInput>,
): Prisma.CharacterCreateInput => {
  return {
    name: faker.person.fullName(),
    description: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};
