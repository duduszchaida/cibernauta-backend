import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  await prisma.gameControl.deleteMany();
  await prisma.highscore.deleteMany();
  await prisma.game.deleteMany();
  console.log('Dados antigos removidos');


  const game1 = await prisma.game.create({
    data: {
      game_title: 'Detector de Phishing',
      description:
        'Aprenda a identificar emails maliciosos que tentam roubar suas informações pessoais. Analise cada email com atenção e classifique-o corretamente.',
      difficulty: 2,
      game_type: 'local',
      enabled: true,
      controls: {
        create: [
          {
            key_image: 'mouse',
            description: 'Navegar e selecionar',
            order: 1,
          },
          {
            key_image: 'click_l',
            description: 'Interagir com elementos',
            order: 2,
          },
        ],
      },
    },
  });

  const game2 = await prisma.game.create({
    data: {
      game_title: 'Criador de Senhas Seguras',
      description:
        'Domine a arte de criar senhas fortes e aprenda sobre gerenciadores de senhas.',
      difficulty: 1,
      game_type: 'external',
      enabled: false,
    },
  });

  const game3 = await prisma.game.create({
    data: {
      game_title: 'Mestre da Criptografia',
      description: 'Entenda conceitos de criptografia de dados na internet',
      difficulty: 3,
      game_type: 'external',
      enabled: false,
    },
  });

  const game4 = await prisma.game.create({
    data: {
      game_title: 'Segurança em Redes Sociais',
      description:
        'Aprenda a proteger sua privacidade e dados nas redes sociais',
      difficulty: 1,
      game_type: 'external',
      enabled: false,
    },
  });

  const game5 = await prisma.game.create({
    data: {
      game_title: 'Proteção Contra Malware',
      description:
        'Identifique e proteja-se contra vírus, trojans e outros malwares',
      difficulty: 2,
      game_type: 'external',
      enabled: false,
    },
  });

  console.log('Jogos criados com sucesso:');
  console.log(`   - ${game1.game_title} (Local - Habilitado)`);
  console.log(`   - ${game2.game_title} (Externo - Desabilitado)`);
  console.log(`   - ${game3.game_title} (Externo - Desabilitado)`);
  console.log(`   - ${game4.game_title} (Externo - Desabilitado)`);
  console.log(`   - ${game5.game_title} (Externo - Desabilitado)`);

  console.log('\nSeed concluído com sucesso!');
  console.log('\nPara criar uma conta de administrador:');
  console.log('1. Crie uma conta pelo sistema (http://localhost:5173)');
  console.log('2. Execute no banco de dados:');
  console.log("   UPDATE users SET role = 'ADMIN', admin = true WHERE user_email = 'seu-email@example.com';");
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });