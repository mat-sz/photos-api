# photos-api

API for my photo storage system.

**This app is not ready for production deployment yet.**

## Installation

Run the following commands:

```
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

This will generate an user with the following details:

| Username | test |
| Password | test |

There is no way to change the password without manually editing the database file yet.

After executing the commands above, download [photos-web](https://github.com/mat-sz/photos-web), follow the instructions there and copy the resulting build to ./public.