import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { Pool } from "pg";
import "dotenv/config";


const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,
});


const adapter = new PrismaPg(pool);


const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Iniciando seed...");


  const passwordHash = await bcrypt.hash(
    "Admin@123",
    10,
  );


  // ORGANIZAÇÃO IBAG

  const ibag = await prisma.organization.create({
    data: {
      nome: "IBAG",
      dominio: "ibag.one",
    },
  });


  const campusCachoeirinha =
    await prisma.campus.create({
      data: {
        nome: "Campus Cachoeirinha",
        cidade: "Cachoeirinha",
        estado: "RS",
        organizationId: ibag.id,
      },
    });


  const campusEsteio =
    await prisma.campus.create({
      data: {
        nome: "Campus Esteio",
        cidade: "Esteio",
        estado: "RS",
        organizationId: ibag.id,
      },
    });


  const pessoaIbag =
    await prisma.person.create({
      data: {
        nome: "Administrador IBAG",
        email: "admin@ibag.one",
        campusId: campusCachoeirinha.id,
        organizationId: ibag.id,
      },
    });


  await prisma.user.create({
    data: {
      loginEmail: "admin@ibag.one",
      passwordHash,
      personId: pessoaIbag.id,
      organizationId: ibag.id,
    },
  });


  // ORGANIZAÇÃO IGREJA CENTRAL

  const igrejaCentral =
    await prisma.organization.create({
      data: {
        nome: "Igreja Central",
        dominio: "igrejacentral.one",
      },
    });


  const campusIgrejaCentral =
    await prisma.campus.create({
      data: {
        nome: "Campus Igreja Central",
        cidade: "Belo Horizonte",
        estado: "MG",
        organizationId: igrejaCentral.id,
      },
    });


  const pessoaIgrejaCentral =
    await prisma.person.create({
      data: {
        nome: "Administrador Igreja Central",
        email: "admin@igrejacentral.one",
        campusId: campusIgrejaCentral.id,
        organizationId: igrejaCentral.id,
      },
    });


  await prisma.user.create({
    data: {
      loginEmail: "admin@igrejacentral.one",
      passwordHash,
      personId: pessoaIgrejaCentral.id,
      organizationId: igrejaCentral.id,
    },
  });


  console.log("✅ Seed concluído!");
  console.log("");
  console.log("Organizações criadas:");
  console.log({
    IBAG: ibag.id,
    IgrejaCentral: igrejaCentral.id,
  });
}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
