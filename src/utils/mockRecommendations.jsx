const CROPS = [
  { name: 'Rice', code: 'RI', ph: [5.0, 6.8], temp: [20, 32], rain: [140, 320] },
  { name: 'Maize', code: 'MZ', ph: [5.5, 7.5], temp: [18, 30], rain: [60, 140] },
  { name: 'Wheat', code: 'WH', ph: [6.0, 7.5], temp: [12, 25], rain: [40, 110] },
  { name: 'Cotton', code: 'CT', ph: [5.8, 8.0], temp: [21, 35], rain: [50, 120] },
  { name: 'Sugarcane', code: 'SC', ph: [6.0, 7.8], temp: [20, 35], rain: [90, 180] },
  { name: 'Millets', code: 'ML', ph: [5.0, 7.5], temp: [20, 34], rain: [30, 90] },
  { name: 'Groundnut', code: 'GN', ph: [6.0, 7.5], temp: [20, 30], rain: [50, 125] },
  { name: 'Soybean', code: 'SB', ph: [6.0, 7.0], temp: [20, 30], rain: [60, 150] },
  { name: 'Barley', code: 'BR', ph: [6.0, 7.5], temp: [12, 25], rain: [30, 90] },
  { name: 'Pulses', code: 'PL', ph: [6.0, 7.8], temp: [18, 32], rain: [35, 100] },
];

function seeded(seed, min, max, offset = 0) {
  const value = Math.sin(seed + offset) * 10000;
  const fraction = value - Math.floor(value);
  return Number((min + fraction * (max - min)).toFixed(1));
}

function scoreCrop(crop, soilPh, temperature, rainfall) {
  let score = 9.8;

  if (soilPh < crop.ph[0]) score -= (crop.ph[0] - soilPh) * 1.7;
  if (soilPh > crop.ph[1]) score -= (soilPh - crop.ph[1]) * 1.7;
  if (temperature < crop.temp[0]) score -= (crop.temp[0] - temperature) / 3;
  if (temperature > crop.temp[1]) score -= (temperature - crop.temp[1]) / 3;
  if (rainfall < crop.rain[0]) score -= (crop.rain[0] - rainfall) / 45;
  if (rainfall > crop.rain[1]) score -= (rainfall - crop.rain[1]) / 45;

  return Number(Math.max(4.8, score).toFixed(1));
}

export function buildStaticRecommendation({ centroid_lat, centroid_lon, polygon }) {
  const seed = Math.abs(Math.round((centroid_lat + centroid_lon) * 10000)) || 12345;
  const soilPh = seeded(seed, 5.4, 7.8, 1);
  const temperature = seeded(seed, 19, 34, 2);
  const rainfall = seeded(seed, 40, 240, 3);
  const fertilityIndex = seeded(seed, 35, 90, 4);
  const soil_fertility_status =
    fertilityIndex < 50 ? 'Low' : fertilityIndex < 72 ? 'Medium' : 'High';

  const recommended_crops = CROPS.map((crop, index) => ({
    crop: crop.name,
    name: crop.name,
    code: crop.code,
    score: Number((scoreCrop(crop, soilPh, temperature, rainfall) - index * 0.02).toFixed(1)),
  })).sort((a, b) => b.score - a.score);

  const createdAt = new Date().toISOString();

  return {
    id: `mock-${seed}-${Date.now()}`,
    farm_name: `Farm Plot ${new Date(createdAt).toLocaleDateString()}`,
    created_at: createdAt,
    soil_ph: soilPh,
    temperature,
    rainfall,
    soil_fertility_status,
    top_crops: recommended_crops,
    recommended_crops,
    weather_forecast: {
      summary:
        rainfall < 90
          ? 'Dry spell likely. Preserve soil moisture and irrigate early morning.'
          : 'Moderate moisture conditions expected with manageable field operations.',
    },
    fertilizer_suggestion:
      soil_fertility_status === 'Low'
        ? 'Apply compost plus a basal NPK dose before sowing.'
        : soil_fertility_status === 'Medium'
          ? 'Use balanced NPK with micronutrient support at the early growth stage.'
          : 'Use lighter nitrogen and monitor micronutrient balance during crop growth.',
    irrigation_suggestion:
      temperature > 30
        ? 'Use split irrigation and avoid midday watering to reduce moisture loss.'
        : 'Maintain stage-based irrigation and inspect drainage after rainfall.',
    polygon,
  };
}
