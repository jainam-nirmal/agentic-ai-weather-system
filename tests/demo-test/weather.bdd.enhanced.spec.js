// tests/api/weather.bdd.enhanced.spec.js
// ─────────────────────────────────────────────────────────────
//  Weather API Test Suite - Enhanced BDD with Response Display
//  Framework: Playwright Test with BDD structure
//  Report: HTML with detailed API responses and validation steps
// ─────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import { getWeatherByCity } from '../../utils/weatherHelper';
import {
  generateToken, generateExpiredToken,
  generateTamperedToken, bearerHeader, protectedEndpoint,
} from '../../utils/authHelper';
import {
  displayWeatherReport,
  displayJWTResponse,
  displayValidationResults,
  attachResponseData,
} from '../../utils/reportHelper';

// ════════════════════════════════════════════════════════════
//  FEATURE: Weather API Testing with Enhanced Reporting
// ════════════════════════════════════════════════════════════

test.describe('Weather API Test Suite - Enhanced BDD', () => {

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 1: Get Weather Report for a City
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 1: Get Weather Report with Response Display', () => {

    test('Should fetch and validate weather report with detailed response', async ({ request }) => {

      const CITY = 'Bhopal';
      let report;
      const validations = [];

      // GIVEN: User wants to get weather data for a city
      await test.step(`GIVEN: User requests weather data for ${CITY}`, async () => {
        console.log(`Requesting weather data for: ${CITY}`);
      });

      // WHEN: User calls the weather API
      await test.step('⏳ WHEN: Weather API is called', async () => {
        report = await getWeatherByCity(request, CITY);
        console.log('Weather API called successfully');
      });

      // Display full API response
      await attachResponseData('Full API Response', report, 'json');

      // THEN: Response should contain valid weather data
      await test.step('THEN: Response contains valid weather data', async () => {

        // ── Validate HTTP responses ──────────────────────
        await test.step('Step 1: Validate HTTP Status Codes', async () => {
          expect(report._meta.geoStatusCode).toBe(200);
          expect(report._meta.forecastStatusCode).toBe(200);
          
          validations.push({
            name: 'Geo API Status',
            passed: report._meta.geoStatusCode === 200,
            details: `Status: ${report._meta.geoStatusCode}`,
          });
          validations.push({
            name: 'Forecast API Status',
            passed: report._meta.forecastStatusCode === 200,
            details: `Status: ${report._meta.forecastStatusCode}`,
          });
          
          console.log('Both API calls returned HTTP 200');
        });

        // ── Validate Location Data ───────────────────────
        await test.step('Step 2: Validate Location Information', async () => {
          expect(report.city).toBeTruthy();
          expect(report.country).toBeTruthy();
          
          validations.push({
            name: 'City Name Present',
            passed: !!report.city,
            details: `City: ${report.city}`,
          });
          validations.push({
            name: 'Country Name Present',
            passed: !!report.country,
            details: `Country: ${report.country}`,
          });
          
          console.log(`Location: ${report.city}, ${report.country}`);
        });

        // ── Validate Current Weather ─────────────────────
        await test.step('Step 3: Validate Current Weather Data', async () => {
          expect(report.current.temperature).toMatch(/°C$/);
          expect(report.current.condition).toBeTruthy();
          expect(report.current.windSpeed).toMatch(/km\/h$/);
          expect(typeof report.current.isDay).toBe('boolean');
          
          const currentWeatherData = {
            'Temperature': report.current.temperature,
            'Condition': report.current.condition,
            'Wind Speed': report.current.windSpeed,
            'Day/Night': report.current.isDay ? 'Daytime' : 'Nighttime',
          };
          
          validations.push({
            name: 'Current Weather Data Valid',
            passed: true,
            details: `Temp: ${report.current.temperature}, Condition: ${report.current.condition}`,
          });
          
          console.log('Current Weather Data:');
          console.table(currentWeatherData);
        });

        // ── Validate Today's Forecast ────────────────────
        await test.step('Step 4: Validate Today\'s Forecast', async () => {
          expect(report.today.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(report.today.high).toMatch(/°C$/);
          expect(report.today.low).toMatch(/°C$/);
          expect(report.today.precipitation).toMatch(/mm$/);
          expect(report.today.maxWind).toMatch(/km\/h$/);
          expect(report.today.condition).toBeTruthy();
          
          const forecastData = {
            'Date': report.today.date,
            'High': report.today.high,
            'Low': report.today.low,
            'Precipitation': report.today.precipitation,
            'Max Wind': report.today.maxWind,
            'Condition': report.today.condition,
          };
          
          validations.push({
            name: 'Today\'s Forecast Valid',
            passed: true,
            details: `High: ${report.today.high}, Low: ${report.today.low}`,
          });
          
          console.log('Today\'s Forecast:');
          console.table(forecastData);
        });

        // ── Validate Coordinates ─────────────────────────
        await test.step('Step 5: Validate Geographic Coordinates', async () => {
          expect(report._meta.lat).toBeGreaterThan(-90);
          expect(report._meta.lat).toBeLessThan(90);
          expect(report._meta.lon).toBeGreaterThan(-180);
          expect(report._meta.lon).toBeLessThan(180);
          
          const coordinateData = {
            'Latitude': report._meta.lat,
            'Longitude': report._meta.lon,
            'Valid': 'Yes',
          };
          
          validations.push({
            name: 'Geographic Coordinates Valid',
            passed: true,
            details: `Lat: ${report._meta.lat}, Lon: ${report._meta.lon}`,
          });
          
          console.log('Geographic Coordinates:');
          console.table(coordinateData);
        });
      });

      // Display full weather report
      await displayWeatherReport(report);

      // Display validation summary
      await displayValidationResults(validations);
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 2: JWT Auth - Valid Token with Response
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 2: JWT Authentication - Valid Token', () => {

    test('Should grant access with valid JWT token and display response', async () => {

      let token, header, result;

      // GIVEN: A valid JWT token is generated
      await test.step('GIVEN: Valid JWT token is generated', async () => {
        token = generateToken({ userId: 1, role: 'tester' });
        header = bearerHeader(token);
        console.log(`✓ Token generated (preview): ${token.substring(0, 40)}...`);
      });

      // Display token in report
      await attachResponseData('Generated JWT Token', { 
        tokenPreview: token.substring(0, 40) + '...',
        header: header,
      }, 'json');

      // WHEN: Token is sent to protected endpoint
      await test.step('WHEN: Token is sent to protected endpoint', async () => {
        result = protectedEndpoint(header.Authorization);
        console.log(' Request sent to protected endpoint');
      });

      // THEN: Access should be granted
      await test.step('THEN: Access should be granted with 200 status', async () => {
        expect(result.status).toBe(200);
        expect(result.user.userId).toBe(1);
        expect(result.user.role).toBe('tester');
        
        console.log(`  Status: ${result.status}`);
        console.log(`  User ID: ${result.user.userId}`);
        console.log(`  Role: ${result.user.role}`);
      });

      // Display JWT response
      await displayJWTResponse(result, 'Valid');
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 3: JWT Auth - Expired Token with Response
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 3: JWT Authentication - Expired Token', () => {

    test('Should reject expired JWT token with 401 and display response', async () => {

      let expiredToken, result;

      // GIVEN: An expired JWT token
      await test.step('GIVEN: Expired JWT token is generated', async () => {
        expiredToken = generateExpiredToken();
        console.log(`Expired token generated`);
        await new Promise(r => setTimeout(r, 10));
      });

      // WHEN: Expired token is sent to protected endpoint
      await test.step(' WHEN: Expired token is sent to protected endpoint', async () => {
        result = protectedEndpoint(`Bearer ${expiredToken}`);
        console.log('Request sent with expired token');
      });

      // THEN: Access should be denied
      await test.step('THEN: Access should be denied with 401 status', async () => {
        expect(result.status).toBe(401);
        expect(result.error).toBeTruthy();
        
        console.log(`  Status: ${result.status}`);
        console.log(`  Error: ${result.error}`);
      });

      // Display JWT response
      await displayJWTResponse(result, 'Expired');
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 4: JWT Auth - Tampered Token with Response
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 4: JWT Authentication - Tampered Token', () => {

    test('Should reject tampered JWT token with 401 and display response', async () => {

      let tamperedToken, result;

      // GIVEN: A tampered JWT token
      await test.step('GIVEN: Tampered JWT token is generated', async () => {
        tamperedToken = generateTamperedToken();
        console.log(`Tampered token generated`);
      });

      // WHEN: Tampered token is sent to protected endpoint
      await test.step('WHEN: Tampered token is sent to protected endpoint', async () => {
        result = protectedEndpoint(`Bearer ${tamperedToken}`);
        console.log('Request sent with tampered token');
      });

      // THEN: Access should be denied
      await test.step(' THEN: Access should be denied with 401 status', async () => {
        expect(result.status).toBe(401);
        expect(result.error).toBeTruthy();
        
        console.log(`  Status: ${result.status}`);
        console.log(`  Error: ${result.error}`);
      });

      // Display JWT response
      await displayJWTResponse(result, 'Tampered');
    });
  });

  // ════════════════════════════════════════════════════════════
  //  SCENARIO 5: JWT Auth - Missing Token with Response
  // ════════════════════════════════════════════════════════════

  test.describe('Scenario 5: JWT Authentication - Missing Token', () => {

    test('Should return 401 when token is missing and display response', async () => {

      let result;

      // GIVEN: No JWT token is provided
      await test.step('GIVEN: No JWT token is provided', async () => {
        console.log('No token in request');
      });

      // WHEN: Request is sent to protected endpoint without token
      await test.step('WHEN: Request is sent to protected endpoint', async () => {
        result = protectedEndpoint(undefined);
        console.log('Request sent without token');
      });

      // THEN: Access should be denied
      await test.step('THEN: Access should be denied with 401 status', async () => {
        expect(result.status).toBe(401);
        expect(result.error).toContain('Missing');
        
        console.log(`  Status: ${result.status}`);
        console.log(`  Error: ${result.error}`);
      });

      // Display JWT response
      await displayJWTResponse(result, 'Missing');
    });
  });
});
