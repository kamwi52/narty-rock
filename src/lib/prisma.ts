/**
 * Prisma placeholder for the current mock-data build.
 *
 * Install `@prisma/client`, run `prisma generate`, and replace this file with
 * the encrypted Prisma client extension when the app moves to database mode.
 */

const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "Prisma is not configured. Install @prisma/client, generate the client, and wire API routes to the database first."
      );
    },
  }
);

export default prisma;
