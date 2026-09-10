import { PrismaClient, AchievementRequirementType, AchievementTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      key: 'FIRST_MATCH',
      name: 'Primo Passo',
      description: 'Gioca la tua prima partita',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 1,
      tier: AchievementTier.FREE,
    },
    {
      key: 'FIRST_WIN',
      name: 'Prima Vittoria',
      description: 'Ottieni la tua prima vittoria',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 1,
      tier: AchievementTier.FREE,
    },
    {
      key: 'FIRST_GOAL',
      name: 'Primo Gol',
      description: 'Segna il tuo primo gol in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 1,
      tier: AchievementTier.FREE,
    },
    {
      key: 'HAT_TRICK',
      name: 'Pokerissimo',
      description: 'Segna 3 gol in una singola partita',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 3,
      tier: AchievementTier.FREE,
    },
    {
      key: 'FIVE_GOALS',
      name: 'Marcatore Naturale',
      description: 'Segna 5 gol in una singola partita',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 5,
      tier: AchievementTier.FREE,
    },
    {
      key: 'ON_FIRE',
      name: 'Stato di Grazia',
      description: 'Segna almeno 5 gol in 5 partite consecutive',
      requirementType: AchievementRequirementType.STREAK,
      requirementValue: 5,
      tier: AchievementTier.FREE,
    },
    {
      key: 'UNBEATEN_5',
      name: 'Muro Difensivo',
      description: 'Rimani imbattuto per 5 partite consecutive',
      requirementType: AchievementRequirementType.STREAK,
      requirementValue: 5,
      tier: AchievementTier.FREE,
    },
    {
      key: 'UNBEATEN_10',
      name: 'Invincibile',
      description: 'Rimani imbattuto per 10 partite consecutive',
      requirementType: AchievementRequirementType.STREAK,
      requirementValue: 10,
      tier: AchievementTier.FREE,
    },
    {
      key: 'TEN_WINS',
      name: 'Vincitore Nato',
      description: 'Ottieni 10 vittorie in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 10,
      tier: AchievementTier.FREE,
    },
    {
      key: 'FIFTY_WINS',
      name: 'Campione',
      description: 'Ottieni 50 vittorie in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 50,
      tier: AchievementTier.FREE,
    },
    {
      key: 'MATCHES_10',
      name: 'Appassionato',
      description: 'Gioca 10 partite in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 10,
      tier: AchievementTier.FREE,
    },
    {
      key: 'MATCHES_50',
      name: 'Calciatore Navetta',
      description: 'Gioca 50 partite in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 50,
      tier: AchievementTier.FREE,
    },
    {
      key: 'MATCHES_100',
      name: 'Veterano',
      description: 'Gioca 100 partite in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 100,
      tier: AchievementTier.FREE,
    },
    {
      key: 'GOALS_10',
      name: 'Attaccante Promettente',
      description: 'Segna 10 gol in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 10,
      tier: AchievementTier.FREE,
    },
    {
      key: 'GOALS_50',
      name: 'Bomber',
      description: 'Segna 50 gol in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 50,
      tier: AchievementTier.FREE,
    },
    {
      key: 'GOALS_100',
      name: 'Capocannoniere',
      description: 'Segna 100 gol in carriera',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 100,
      tier: AchievementTier.FREE,
    },
    {
      key: 'CAREER_INDEX_1200',
      name: 'Giocatore di Serie',
      description: 'Raggiungi un Indice di Carriera di 1200 punti',
      requirementType: AchievementRequirementType.VALUE_CAREER_INDEX,
      requirementValue: 1200,
      tier: AchievementTier.FREE,
    },
    {
      key: 'CAREER_INDEX_1500',
      name: 'Top Player',
      description: 'Raggiungi un Indice di Carriera di 1500 punti',
      requirementType: AchievementRequirementType.VALUE_CAREER_INDEX,
      requirementValue: 1500,
      tier: AchievementTier.FREE,
    },
    {
      key: 'LEVEL_10',
      name: 'Crescita Costante',
      description: 'Raggiungi il livello 10',
      requirementType: AchievementRequirementType.VALUE_LEVEL,
      requirementValue: 10,
      tier: AchievementTier.FREE,
    },
    {
      key: 'LEVEL_25',
      name: 'Calciatore Esperto',
      description: 'Raggiungi il livello 25',
      requirementType: AchievementRequirementType.VALUE_LEVEL,
      requirementValue: 25,
      tier: AchievementTier.FREE,
    },
    {
      key: 'LEVEL_50',
      name: 'Leggenda Vivente',
      description: 'Raggiungi il livello 50',
      requirementType: AchievementRequirementType.VALUE_LEVEL,
      requirementValue: 50,
      tier: AchievementTier.FREE,
    },
    {
      key: 'MATCHES_250',
      name: 'Stagionato',
      description: 'Gioca 250 partite in carriera (PRO)',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 250,
      tier: AchievementTier.PRO,
    },
    {
      key: 'MATCHES_500',
      name: 'Gladiatore',
      description: 'Gioca 500 partite in carriera (PRO)',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 500,
      tier: AchievementTier.PRO,
    },
    {
      key: 'CAREER_INDEX_1800',
      name: 'Elite',
      description: 'Raggiungi un Indice di Carriera di 1800 punti (PRO)',
      requirementType: AchievementRequirementType.VALUE_CAREER_INDEX,
      requirementValue: 1800,
      tier: AchievementTier.PRO,
    },
    {
      key: 'GOALS_250',
      name: 'Attaccante Storico',
      description: 'Segna 250 gol in carriera (PRO)',
      requirementType: AchievementRequirementType.COUNT,
      requirementValue: 250,
      tier: AchievementTier.PRO,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        name: achievement.name,
        description: achievement.description,
        requirementType: achievement.requirementType,
        requirementValue: achievement.requirementValue,
        tier: achievement.tier,
      },
      create: achievement,
    });
    console.log(`Achievement ${achievement.key} creato/aggiornato.`);
  }

  console.log(`Seed completato: ${achievements.length} achievement processati.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
