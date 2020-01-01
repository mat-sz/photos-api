# photos-api

API for my photo storage system.

**This app is not ready for production deployment yet.**

## Environment variables

| Variable      | Default value | Description                                                    |
|---------------|---------------|----------------------------------------------------------------|
| `IP`          | `127.0.0.1`   | IP address to bind to.                                         |
| `PORT`        | `4000`        | Port to bind to.                                               |
| `HASHID_SALT` | `salt`        | Salt for hashids, **make sure to set it to something unique.** |

## Installation

Run the following commands:

```
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

This will generate an user with the following details:

|          |      |
|----------|------|
| Username | test |
| Password | test |

There is no way to change the password without manually editing the database file yet.

After executing the commands above, download [photos-web](https://github.com/mat-sz/photos-web), follow the instructions there and copy the resulting build to ./public.