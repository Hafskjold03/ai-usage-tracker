# AI Usage Tracker

This is a full-stack web application developed using Next.js, React, Shadcn, TypeScript, Prisma ORM, and SQLite. It enables users to log their AI usage for school work and ensures it regulates with institutional guidelines.

## Initialization

### Install all project dependencies

The service runs locally on your computer and has multiple depencencies you have to install, to install them run:

```bash
npm install
```

### Declare environment variables

You have to declare some environment variables for the project, so start with creating a file called ".env" in the root directory of the project and enter a file destionation for the database and a JWT-secret.

```bash
# Declare the database file destination
DATABASE_URL="file:./dev.db"
# Here we create our JWT secret key, allowing us to sign and verify JSON web tokens
JWT_SECRET="my-super-cool-secret-key"
```

### Initialize the database

Run this to migrate the database (MIGHT NOT BE NEEDED):

```bash
npx prisma migrate dev --name init
```

Run this to generate the database:

```bash
npx prisma generate
```

### Run the service

Now all you need to do is run it locally on your computer by using the command:

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the application.
