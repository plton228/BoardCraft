import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialUsers = [
  {
    name: 'Сергій Бондаренко',
    email: 'serhii.bondarenko@example.com',
    role: 'Менеджер',
    department: 'Продажі та маркетинг',
  },
  {
    name: 'Тетяна Мороз',
    email: 'tetiana.moroz@example.com',
    role: 'Адміністратор',
    department: 'ІТ та безпека',
  },
  {
    name: 'Олександр Кравченко',
    email: 'oleksandr.kravchenko@example.com',
    role: 'Розробник',
    department: 'Інженерія',
  },
  {
    name: 'Наталія Колісник',
    email: 'nataliia.kolisnyk@example.com',
    role: 'Аналітик',
    department: 'Аналітика даних',
  },
  {
    name: 'Ярослав Шевченко',
    email: 'yaroslav.shevchenko@example.com',
    role: 'Розробник',
    department: 'Інженерія',
  },
];

async function main() {
  console.log('Seeding initial users for Practical 4...');
  
  
  await prisma.user.deleteMany();
  
  for (const user of initialUsers) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    console.log(`Created user: ${createdUser.name} (${createdUser.email})`);
  }
  
  console.log('Database seeding completed successfully for Practical 4.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
