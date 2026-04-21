export function normalizeCropName(crop = '') {
  return String(crop).trim().toLowerCase();
}

function buildLandPreparationSteps(cropName, farmName) {
  return [
    `Walk through ${farmName || 'the field'} and remove stones, weeds, and old residue before starting soil work for ${cropName}.`,
    'Break the top layer, level the surface, and open drainage channels where water may stand.',
    'Apply compost or well-decomposed manure early so it mixes into the soil before sowing.',
    'Keep seed, fertilizer, and irrigation material ready before the first field operation begins.',
  ];
}

function buildCropSpecificSteps(cropName, recommendation) {
  const soilTexture = recommendation?.soil_data?.texture || 'the current soil';
  const rainfall = recommendation?.climate_data?.rainfall;

  const templates = {
    rice: [
      'Prepare a fine seedbed or nursery area first, then plan puddling only if the water source is dependable.',
      'Transplant or direct-seed in straight rows so weeding and water movement stay manageable.',
      'Maintain shallow standing water only after establishment, not immediately after sowing.',
      'Watch for yellowing leaves and adjust nitrogen in split doses instead of one heavy application.',
    ],
    maize: [
      'Form straight ridges or rows with enough spacing for root growth and intercultivation.',
      'Place seed at uniform depth and avoid sowing into very wet soil.',
      'Give the first nutrient top-dress after establishment and earth up the base when plants gain height.',
      'Inspect the whorl and leaf underside regularly for early pest damage.',
    ],
    cotton: [
      'Open the field well and keep row spacing generous so light and airflow stay strong through the season.',
      'Do not rush into sowing if the topsoil is cold or waterlogged.',
      'Feed the crop in stages and keep an eye on square and boll formation before adding more nitrogen.',
      'Remove volunteer weeds early because they compete heavily in the first growth period.',
    ],
    sugarcane: [
      'Create deep, well-marked furrows and place setts in evenly spaced lines.',
      'Cover setts with light soil first, then build up the ridge as shoots establish.',
      'Keep the field moist during early sprouting but do not let water stagnate around the rows.',
      'Plan trash mulching and earthing up early because they strongly affect cane vigour later.',
    ],
    wheat: [
      'Level the land carefully so irrigation spreads evenly across the entire field.',
      'Sow into a firm but not compact seedbed and avoid uneven seed placement.',
      'Give the first irrigation at the proper early stage instead of watering immediately without need.',
      'Watch tillering closely before deciding the next fertilizer split.',
    ],
    groundnut: [
      'Keep the bed loose and friable because pegging becomes difficult in hard soil.',
      'Sow only after the surface has enough moisture for quick emergence.',
      'Avoid standing water once flowering begins.',
      'Keep the field clean during early spread so the crop canopy can close properly.',
    ],
  };

  const generic = [
    `Use ${soilTexture} as the base condition while planning seed depth, spacing, and first irrigation for ${cropName}.`,
    rainfall !== undefined && rainfall !== null
      ? `Current rainfall in the report is ${rainfall} mm, so plan irrigation around that instead of following a fixed schedule.`
      : 'Use the current moisture condition in the report when deciding the first irrigation timing.',
    'Do the first nutrient application in measured splits and adjust only after observing early crop response.',
    'Check field condition every few days during establishment so problems are corrected before they spread.',
  ];

  return templates[normalizeCropName(cropName)] || generic;
}

export function buildCropGuide({ crop, farm, recommendation }) {
  const cropName = crop?.name || crop?.crop || 'Selected crop';

  return {
    cropName,
    farmName: farm?.name || 'Saved field',
    landPreparation: buildLandPreparationSteps(cropName, farm?.name),
    cultivation: buildCropSpecificSteps(cropName, recommendation),
  };
}
