import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Iniciando seed IBAG One...");

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  /*
   * ORGANIZAÇÃO IBAG
   */
  const ibag = await prisma.organization.upsert({
    where: {
      dominio: "ibag.one",
    },
    update: {},
    create: {
      nome: "IBAG",
      dominio: "ibag.one",
    },
  });

  const ibagCachoeirinha = await prisma.campus.upsert({
    where: {
      id: "campus-ibag-cachoeirinha",
    },
    update: {},
    create: {
      id: "campus-ibag-cachoeirinha",
      nome: "IBAG Cachoeirinha",
      cidade: "Cachoeirinha",
      estado: "RS",
      organizationId: ibag.id,
    },
  });

  const ibagEsteio = await prisma.campus.upsert({
    where: {
      id: "campus-ibag-esteio",
    },
    update: {},
    create: {
      id: "campus-ibag-esteio",
      nome: "IBAG Esteio",
      cidade: "Esteio",
      estado: "RS",
      organizationId: ibag.id,
    },
  });

  const pessoaIbag = await prisma.person.upsert({
    where: {
      email: "admin@ibag.one",
    },
    update: {},
    create: {
      nome: "Administrador IBAG One",
      email: "admin@ibag.one",
      campusId: ibagCachoeirinha.id,
      organizationId: ibag.id,
    },
  });

  await prisma.user.upsert({
    where: {
      loginEmail: "admin@ibag.one",
    },
    update: {},
    create: {
      loginEmail: "admin@ibag.one",
      passwordHash,
      personId: pessoaIbag.id,
      organizationId: ibag.id,
    },
  });


  /*
   * ORGANIZAÇÃO IGREJA CENTRAL
   */
  const igrejaCentral = await prisma.organization.upsert({
    where: {
      dominio: "igrejacentral.one",
    },
    update: {},
    create: {
      nome: "Igreja Central",
      dominio: "igrejacentral.one",
    },
  });


  const campusCentral = await prisma.campus.upsert({
    where: {
      id: "campus-igreja-central",
    },
    update: {},
    create: {
      id: "campus-igreja-central",
      nome: "Igreja Central",
      cidade: "Belo Horizonte",
      estado: "MG",
      organizationId: igrejaCentral.id,
    },
  });


  const pessoaCentral = await prisma.person.upsert({
    where: {
      email: "admin@igrejacentral.one",
    },
    update: {},
    create: {
      nome: "Administrador Igreja Central",
      email: "admin@igrejacentral.one",
      campusId: campusCentral.id,
      organizationId: igrejaCentral.id,
    },
  });


  await prisma.user.upsert({
    where: {
      loginEmail: "admin@igrejacentral.one",
    },
    update: {},
    create: {
      loginEmail: "admin@igrejacentral.one",
      passwordHash,
      personId: pessoaCentral.id,
      organizationId: igrejaCentral.id,
    },
  });


  console.log("✅ Seed concluído!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
