import 'dotenv/config';

const GEO_URL = process.env.GEO_URL;
const FORECAST_URL = process.env.FORECAST_URL;
const WMO_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
};

export async function getWeatherByCity(request, cityName) {
  const coords = await getCityCoordinates(request, cityName);
  const weather = await fetchWeather(request, coords.lat, coords.lon, coords.timezone);
  return buildReport(cityName, coords, weather);
}

async function getCityCoordinates(request, cityName) {
  const response = await request.get(GEO_URL, {
    params: {
      name: cityName,
      count: 1,
      language: 'en',
      format: 'json',
    },
  });

  const body = await response.json();

  if (!response.ok()) {
    throw new Error(`Geocoding API error (${response.status()})`);
  }
  if (!body.results || body.results.length === 0) {
    throw new Error(`City not found: "${cityName}"`);
  }

  const place = body.results[0];
  return {
    lat: place.latitude,
    lon: place.longitude,
    city: place.name,
    country: place.country,
    timezone: place.timezone || 'auto',
    statusCode: response.status(),
  };
}

async function fetchWeather(request, lat, lon, timezone) {
  const response = await request.get(FORECAST_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'weathercode',
        'windspeed_10m_max',
      ].join(','),
      forecast_days: 1,
      timezone,
      temperature_unit: 'celsius',
      windspeed_unit: 'kmh',
    },
  });

  const body = await response.json();

  if (!response.ok()) {
    throw new Error(`Forecast API error (${response.status()})`);
  }

  return { body, statusCode: response.status() };
}

function buildReport(cityName, coords, weather) {
  const cw = weather.body.current_weather;
  const daily = weather.body.daily;

  return {
    city: coords.city,
    country: coords.country,
    current: {
      temperature: `${cw.temperature}°C`,
      condition: WMO_CODES[cw.weathercode] || `Code ${cw.weathercode}`,
      windSpeed: `${cw.windspeed} km/h`,
      isDay: cw.is_day === 1,
      observedAt: cw.time,
    },
    today: {
      date: daily.time[0],
      high: `${daily.temperature_2m_max[0]}°C`,
      low: `${daily.temperature_2m_min[0]}°C`,
      precipitation: `${daily.precipitation_sum[0]} mm`,
      maxWind: `${daily.windspeed_10m_max[0]} km/h`,
      condition: WMO_CODES[daily.weathercode[0]] || `Code ${daily.weathercode[0]}`,
    },
    _meta: {
      geoStatusCode: coords.statusCode,
      forecastStatusCode: weather.statusCode,
      lat: coords.lat,
      lon: coords.lon,
    },
  };
}
