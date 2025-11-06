import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  await prisma.highscore.deleteMany();
  await prisma.game.deleteMany();
  console.log('Dados antigos removidos');

  
  const game1 = await prisma.game.create({
    data: {
      game_title: 'Detector de Phishing',
      description:
        'Aprenda a identificar emails maliciosos que tentam roubar suas informações pessoais.',
      difficulty: 2,
    },
  });

  const game2 = await prisma.game.create({
    data: {
      game_title: 'Criador de Senhas Seguras',
      description:
        'Domine a arte de criar senhas fortes e aprenda sobre gerenciadores de senhas.',
      difficulty: 1,
    },
  });

  const game3 = await prisma.game.create({
    data: {
      game_title: 'Mestre da Criptografia',
      description: 'Entenda conceitos de criptografia de dados na internet',
      difficulty: 3,
    },
  });

  const game4 = await prisma.game.create({
    data: {
      game_title: 'Segurança em Redes Sociais',
      description:
        'Aprenda a proteger sua privacidade e dados nas redes sociais',
      difficulty: 1,
    },
  });

  const game5 = await prisma.game.create({
    data: {
      game_title: 'Proteção Contra Malware',
      description:
        'Identifique e proteja-se contra vírus, trojans e outros malwares',
      difficulty: 2,
    },
  });

  console.log('✅ Jogos criados com sucesso:');
  console.log(`   - ${game1.game_title}`);
  console.log(`   - ${game2.game_title}`);
  console.log(`   - ${game3.game_title}`);
  console.log(`   - ${game4.game_title}`);
  console.log(`   - ${game5.game_title}`);

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });