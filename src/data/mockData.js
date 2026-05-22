const randomFrom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const breeds = ['HF', 'Jersey', 'Sahiwal', 'Gir', 'Crossbreed']
const names = ['Gauri', 'Laxmi', 'Rani', 'Moti', 'Kamdhenu', 'Champa', 'Nandini', 'Sona', 'Pari', 'Dhenu']
const statuses = ['Healthy', 'At Risk', 'Sick']

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const pickStatus = (seed) => {
  const roll = seededRandom(seed)
  if (roll < 0.68) return 'Healthy'
  if (roll < 0.9) return 'At Risk'
  return 'Sick'
}

export const cattleData = Array.from({ length: 120 }, (_, index) => {
  const id = `COW-${String(index + 1).padStart(3, '0')}`
  const status = pickStatus(index + 1)
  const temp = Number((37.8 + seededRandom(index + 11) * 2.8).toFixed(1))
  const heartRate = randomFrom(58, 102)
  const spo2 = randomFrom(90, 99)
  const respiration = randomFrom(18, 42)
  const healthScore = Math.max(35, Math.min(98, 100 - Math.round((temp - 38) * 12) - (status === 'Sick' ? 35 : status === 'At Risk' ? 18 : 2)))
  const heatProbability = randomFrom(20, 95)

  return {
    id,
    name: names[index % names.length],
    breed: breeds[index % breeds.length],
    age: randomFrom(2, 8),
    status,
    lastCheck: `${randomFrom(1, 23)}h ago`,
    vitals: {
      temperature: temp,
      heartRate,
      spo2,
      respiration,
    },
    healthScore,
    heatProbability,
    inseminationWindow: heatProbability > 75 ? 'Next 12-18h' : heatProbability > 55 ? 'Within 24h' : 'Observe',
  }
})

const trendBase = [78, 76, 79, 74, 81, 85, 87]
export const healthTrend = trendBase.map((value, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  score: value,
  riskIndex: Math.max(20, 110 - value + randomFrom(1, 8)),
}))

export const diseaseDistribution = [
  { name: 'Fever', value: 40 },
  { name: 'Pneumonia', value: 35 },
  { name: 'Mastitis', value: 25 },
]

export const diseaseCases = [
  {
    disease: 'Fever',
    percentage: 40,
    severity: 'Critical',
    affectedCows: ['COW-012', 'COW-027', 'COW-045', 'COW-101'],
  },
  {
    disease: 'Pneumonia Risk',
    percentage: 35,
    severity: 'Warning',
    affectedCows: ['COW-008', 'COW-033', 'COW-078', 'COW-109'],
  },
  {
    disease: 'Mastitis Detection',
    percentage: 25,
    severity: 'Warning',
    affectedCows: ['COW-006', 'COW-055', 'COW-084'],
  },
]

export const alerts = cattleData
  .filter((cow) => cow.status !== 'Healthy')
  .slice(0, 18)
  .map((cow, idx) => ({
    id: `ALT-${idx + 1}`,
    cowId: cow.id,
    issue:
      cow.status === 'Sick'
        ? 'High temperature and respiration spike'
        : cow.heatProbability > 80
          ? 'Heat detection window active'
          : 'Vitals drift from baseline',
    severity: cow.status === 'Sick' ? 'Critical' : 'Warning',
    timestamp: `${idx + 1}0 min ago`,
  }))

export const cowsInHeat = cattleData
  .filter((cow) => cow.heatProbability > 65)
  .slice(0, 20)

export const getDashboardKpis = () => {
  const total = cattleData.length
  const healthy = cattleData.filter((cow) => cow.status === 'Healthy').length
  const atRisk = cattleData.filter((cow) => cow.status === 'At Risk').length
  const sick = cattleData.filter((cow) => cow.status === 'Sick').length
  const inHeat = cowsInHeat.length

  return { total, healthy, atRisk, sick, inHeat }
}
