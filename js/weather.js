/* ============================================
   WEATHER MODULE
   Fetches Melbourne weather from Open-Meteo API
   ============================================ */

export const Weather = {
  // Melbourne coordinates
  latitude: -37.8136,
  longitude: 144.9631,
  
  // Cache settings
  cacheKey: 'roofing_weather_cache',
  cacheTTL: 15 * 60 * 1000, // 15 minutes
  
  // Weather thresholds for mode detection
  thresholds: {
    storm: { wind: 60, rain: 10 },
    rain: { rain: 2 },
    wind: { wind: 40 }
  },

  /**
   * Fetch weather data from Open-Meteo API
   * @returns {Promise<Object>} Weather data object
   */
  async fetch() {
    try {
      // Check cache first
      const cached = this.getCache();
      if (cached) {
        console.log('[Weather] Using cached data');
        return cached;
      }

      console.log('[Weather] Fetching fresh data from API');
      
      const url = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${this.latitude}&` +
        `longitude=${this.longitude}&` +
        `current=temperature_2m,rain,wind_speed_10m&` +
        `daily=precipitation_sum,wind_speed_10m_max,temperature_2m_min,temperature_2m_max&` +
        `timezone=Australia/Melbourne&` +
        `forecast_days=4`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      // Transform to our format
      const weatherData = this.transform(data);
      
      // Cache it
      this.setCache(weatherData);
      
      // Track success
      if (window.Tracker) {
        window.Tracker.logEvent('weather_fetch_success', {
          mode: weatherData.mode,
          timestamp: Date.now()
        });
      }
      
      return weatherData;
      
    } catch (error) {
      console.error('[Weather] Fetch failed:', error);
      
      // Track failure
      if (window.Tracker) {
        window.Tracker.logEvent('weather_fetch_error', {
          error: error.message,
          timestamp: Date.now()
        });
      }
      
      // Return fallback data
      return this.getFallback();
    }
  },

  /**
   * Transform API response to our format
   * @param {Object} apiData - Raw API response
   * @returns {Object} Transformed weather data
   */
  transform(apiData) {
    const current = apiData.current || {};
    const daily = apiData.daily || {};
    
    // Current conditions
    const currentTemp = Math.round(current.temperature_2m || 0);
    const currentRain = current.rain || 0;
    const currentWind = Math.round(current.wind_speed_10m || 0);
    
    // Daily forecast (next 4 days)
    const forecast = [];
    for (let i = 0; i < 4; i++) {
      forecast.push({
        date: daily.time?.[i] || null,
        precipSum: daily.precipitation_sum?.[i] || 0,
        windMax: Math.round(daily.wind_speed_10m_max?.[i] || 0),
        tempMin: Math.round(daily.temperature_2m_min?.[i] || 0),
        tempMax: Math.round(daily.temperature_2m_max?.[i] || 0)
      });
    }
    
    // Calculate totals
    const rainNext4dTotalMm = forecast.reduce((sum, day) => sum + day.precipSum, 0);
    const maxWindNext4dKmh = Math.max(...forecast.map(day => day.windMax));
    
    // Derive mode and triggers
    const { mode, triggers, stormLikely24h } = this.deriveMode({
      currentRain,
      currentWind,
      rainNext4dTotalMm,
      maxWindNext4dKmh,
      forecast
    });
    
    return {
      fetchedAt: Date.now(),
      current: {
        temp: currentTemp,
        rain: currentRain,
        wind: currentWind
      },
      forecast,
      derived: {
        mode,
        stormLikely24h,
        triggers,
        rainNext4dTotalMm: Math.round(rainNext4dTotalMm * 10) / 10,
        maxWindNext4dKmh
      }
    };
  },

  /**
   * Derive weather mode from conditions
   * @param {Object} conditions - Weather conditions
   * @returns {Object} Mode, triggers, and storm likelihood
   */
  deriveMode(conditions) {
    const {
      currentRain,
      currentWind,
      rainNext4dTotalMm,
      maxWindNext4dKmh,
      forecast
    } = conditions;
    
    const triggers = [];
    let mode = 'calm';
    let stormLikely24h = false;
    
    // Check for storm conditions (highest priority)
    if (currentWind >= this.thresholds.storm.wind) {
      mode = 'storm';
      triggers.push(`wind_${currentWind}kmh`);
    }
    if (currentRain >= this.thresholds.storm.rain) {
      mode = 'storm';
      triggers.push(`rain_${currentRain}mm`);
    }
    
    // Check 24h forecast for storm
    if (forecast[0]) {
      if (forecast[0].windMax >= this.thresholds.storm.wind) {
        stormLikely24h = true;
        triggers.push(`forecast_wind_${forecast[0].windMax}kmh`);
      }
      if (forecast[0].precipSum >= this.thresholds.storm.rain) {
        stormLikely24h = true;
        triggers.push(`forecast_rain_${forecast[0].precipSum}mm`);
      }
    }
    
    // If not storm, check for rain
    if (mode === 'calm' && currentRain >= this.thresholds.rain.rain) {
      mode = 'rain';
      triggers.push(`rain_${currentRain}mm`);
    }
    
    // If not storm or rain, check for wind
    if (mode === 'calm' && currentWind >= this.thresholds.wind.wind) {
      mode = 'wind';
      triggers.push(`wind_${currentWind}kmh`);
    }
    
    return { mode, triggers, stormLikely24h };
  },

  /**
   * Get weather badge text based on mode
   * @param {Object} weatherData - Weather data object
   * @returns {Object} Badge text and icon
   */
  getBadgeContent(weatherData) {
    const { mode, stormLikely24h } = weatherData.derived;
    const { temp, rain, wind } = weatherData.current;
    
    const badges = {
      storm: {
        icon: '⛈️',
        text: `Storm conditions — ${wind}km/h winds, ${rain}mm rain. Emergency repairs available.`
      },
      rain: {
        icon: '🌧️',
        text: `Rainy conditions — ${rain}mm rain. We can still inspect and provide temporary protection.`
      },
      wind: {
        icon: '💨',
        text: `Windy conditions — ${wind}km/h winds. Check your roof for loose tiles.`
      },
      calm: {
        icon: stormLikely24h ? '⚠️' : '☀️',
        text: stormLikely24h 
          ? `Storm forecast in next 24h. Book inspection now to prevent damage.`
          : `Perfect weather for roof inspections — ${temp}°C and clear.`
      }
    };
    
    return badges[mode] || badges.calm;
  },

  /**
   * Get microcopy override based on weather
   * @param {Object} weatherData - Weather data object
   * @returns {string|null} Microcopy text or null
   */
  getMicroOverride(weatherData) {
    const { mode, stormLikely24h } = weatherData.derived;
    
    const overrides = {
      storm: '⚡ Emergency response team on standby',
      rain: '☔ Temporary waterproofing available today',
      wind: '💨 Free storm damage assessment',
      calm: stormLikely24h ? '⚠️ Storm forecast — book preventive inspection' : null
    };
    
    return overrides[mode];
  },

  /**
   * Cache weather data in sessionStorage
   * @param {Object} data - Weather data to cache
   */
  setCache(data) {
    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[Weather] Failed to cache data:', error);
    }
  },

  /**
   * Get cached weather data if still valid
   * @returns {Object|null} Cached data or null
   */
  getCache() {
    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const age = Date.now() - data.fetchedAt;
      
      if (age < this.cacheTTL) {
        return data;
      }
      
      // Cache expired
      sessionStorage.removeItem(this.cacheKey);
      return null;
      
    } catch (error) {
      console.warn('[Weather] Failed to read cache:', error);
      return null;
    }
  },

  /**
   * Get fallback weather data when API fails
   * @returns {Object} Fallback weather data
   */
  getFallback() {
    return {
      fetchedAt: Date.now(),
      current: {
        temp: 18,
        rain: 0,
        wind: 15
      },
      forecast: [
        { date: null, precipSum: 0, windMax: 20, tempMin: 12, tempMax: 22 },
        { date: null, precipSum: 0, windMax: 18, tempMin: 13, tempMax: 21 },
        { date: null, precipSum: 0, windMax: 22, tempMin: 11, tempMax: 20 },
        { date: null, precipSum: 0, windMax: 19, tempMin: 12, tempMax: 21 }
      ],
      derived: {
        mode: 'calm',
        stormLikely24h: false,
        triggers: ['fallback_data'],
        rainNext4dTotalMm: 0,
        maxWindNext4dKmh: 22
      },
      isFallback: true
    };
  },

  /**
   * Clear weather cache (useful for testing)
   */
  clearCache() {
    try {
      sessionStorage.removeItem(this.cacheKey);
      console.log('[Weather] Cache cleared');
    } catch (error) {
      console.warn('[Weather] Failed to clear cache:', error);
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.Weather = Weather;
}
