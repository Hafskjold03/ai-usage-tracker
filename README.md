# AI Usage Tracker

This is a full-stack web application developed using Next.js, React, Shadcn, TypeScript, Prisma ORM, and SQLite. It enables users to log their AI usage for school work and ensures it regulates with institutional guidelines.

## Initialization

The service runs locally on your computer and has multiple depencencies you have to install, to install them run:

```bash
npm i
```

After this you have to declare some environment variables for the project, so create a ".env"-file and declare these variables:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="..."
```

After the environment variables are declared you can generate the database

```bash
npx prisma generate
```

Now all you need to do is run it locally on your computer by using the command:

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the application.
