## Description

API for Star Wars characters created using:

- [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
- PostgreSQL

## Installation

### Every command should be done in backend folder

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Or use docker-compose

```bash
# Copy the variables inside .env.docker.local to .env
$ cp .env.docker.local .env

# in backend folder
$ docker compose up -d
```

## Test

```bash
# unit tests
$ yarn run test

# Copy the variables inside .env.test to .env
$ cp .env.test .env

# Make sure the database via docker-compose is running before running e2e tests:
$ docker compose up db

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

MIT
