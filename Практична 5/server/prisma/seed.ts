import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialUsers = [
  {
    name: 'Олена Коваль',
    email: 'olena.koval@example.com',
    role: 'Адміністратор',
    department: 'ІТ та безпека',
  },
  {
    name: 'Марко Петренко',
    email: 'marko.petrenko@example.com',
    role: 'Менеджер',
    department: 'Продажі та маркетинг',
  },
  {
    name: 'Ірина Бойко',
    email: 'iryna.boiko@example.com',
    role: 'Аналітик',
    department: 'Аналітика даних',
  },
  {
    name: 'Андрій Ткаченко',
    email: 'andrii.tkachenko@example.com',
    role: 'Розробник',
    department: 'Інженерія',
  },
  {
    name: 'Марія Лисенко',
    email: 'mariia.lysenko@example.com',
    role: 'Менеджер',
    department: 'Управління персоналом',
  },
  {
    name: 'Дмитро Шевченко',
    email: 'dmytro.shevchenko@example.com',
    role: 'Розробник',
    department: 'Інженерія',
  },
];

async function main() {
  console.log('Seeding initial users...');
  
  
  await prisma.user.deleteMany();
  
  for (const user of initialUsers) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    console.log(`Created user: ${createdUser.name} (${createdUser.email})`);
  }
  
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
