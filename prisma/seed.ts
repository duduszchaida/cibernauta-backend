import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  await prisma.levelProgress.deleteMany();
  await prisma.highscore.deleteMany();
  await prisma.level.deleteMany();
  await prisma.game.deleteMany();
  console.log('Dados antigos removidos');

  
  const game1 = await prisma.game.create({
    data: {
      game_title: 'Detector de Phishing',
      description:
        'Aprenda a identificar emails maliciosos que tentam roubar suas informações pessoais.',
      difficulty: 2,
      levels: {
        create: [
          { level_title: 'Introdução ao Phishing' },
          { level_title: 'Identificando Links Suspeitos' },
          { level_title: 'Análise de Remetentes' },
          { level_title: 'Verificação de Domínios' },
          { level_title: 'Desafio Final' },
        ],
      },
    },
    include: { levels: true },
  });

  const game2 = await prisma.game.create({
    data: {
      game_title: 'Criador de Senhas Seguras',
      description:
        'Domine a arte de criar senhas fortes e aprenda sobre gerenciadores de senhas.',
      difficulty: 1,
      levels: {
        create: [
          { level_title: 'O Básico das Senhas' },
          { level_title: 'Senhas Fortes vs Fracas' },
          { level_title: 'Gerenciadores de Senhas' },
          { level_title: 'Autenticação de Dois Fatores' },
        ],
      },
    },
    include: { levels: true },
  });

  const game3 = await prisma.game.create({
    data: {
      game_title: 'Mestre da Criptografia',
      description: 'Entenda conceitos de criptografia de dados na internet',
      difficulty: 3,
      levels: {
        create: [
          { level_title: 'O que é Criptografia?' },
          { level_title: 'Criptografia Simétrica' },
          { level_title: 'Criptografia Assimétrica' },
          { level_title: 'HTTPS e SSL/TLS' },
          { level_title: 'Hash e Assinaturas Digitais' },
          { level_title: 'Blockchain Básico' },
        ],
      },
    },
    include: { levels: true },
  });

  const game4 = await prisma.game.create({
    data: {
      game_title: 'Segurança em Redes Sociais',
      description:
        'Aprenda a proteger sua privacidade e dados nas redes sociais',
      difficulty: 1,
      levels: {
        create: [
          { level_title: 'Configurações de Privacidade' },
          { level_title: 'Identificando Perfis Falsos' },
          { level_title: 'Compartilhamento Seguro' },
        ],
      },
    },
    include: { levels: true },
  });

  const game5 = await prisma.game.create({
    data: {
      game_title: 'Proteção Contra Malware',
      description:
        'Identifique e proteja-se contra vírus, trojans e outros malwares',
      difficulty: 2,
      levels: {
        create: [
          { level_title: 'Tipos de Malware' },
          { level_title: 'Downloads Seguros' },
          { level_title: 'Antivírus e Firewall' },
          { level_title: 'Ransomware' },
        ],
      },
    },
    include: { levels: true },
  });

  console.log('✅ Jogos criados com sucesso:');
  console.log(`   - ${game1.game_title} (${game1.levels.length} níveis)`);
  console.log(`   - ${game2.game_title} (${game2.levels.length} níveis)`);
  console.log(`   - ${game3.game_title} (${game3.levels.length} níveis)`);
  console.log(`   - ${game4.game_title} (${game4.levels.length} níveis)`);
  console.log(`   - ${game5.game_title} (${game5.levels.length} níveis)`);

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