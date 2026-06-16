// utils/reportHelper.js
// ─────────────────────────────────────────────────────────────
//  Report Helper - Utility to format and display API responses
//  in Playwright HTML and Allure reports
// ─────────────────────────────────────────────────────────────

import { test } from '@playwright/test';
import { attachment } from 'allure-js-commons';

async function attachToAllure(name, data, contentType = 'application/json') {
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  await attachment(name, body, contentType);
}

/**
 * Attach API response data to test step
 * @param {Object} stepName - Name of the step
 * @param {Object} data - Data to attach (API response, etc.)
 * @param {String} dataType - Type of data: 'json', 'text', 'table'
 */
async function attachResponseData(stepName, data, dataType = 'json') {
  await test.step(`📋 ${stepName}`, async () => {
    if (dataType === 'json') {
      console.log(JSON.stringify(data, null, 2));
      await attachToAllure(stepName, data);
    } else if (dataType === 'table') {
      console.table(data);
      await attachToAllure(stepName, data);
    } else {
      console.log(data);
      await attachToAllure(stepName, data, 'text/plain');
    }
  });
}

/**
 * Create a formatted weather report display
 * @param {Object} report - Weather report object
 */
async function displayWeatherReport(report) {
  await test.step('🌍 Weather Report Summary', async () => {
    const reportSummary = {
      'Location': `${report.city}, ${report.country}`,
      'Latitude': report._meta.lat,
      'Longitude': report._meta.lon,
      'Temperature': report.current.temperature,
      'Condition': report.current.condition,
      'Wind Speed': report.current.windSpeed,
      'Is Day': report.current.isDay ? 'Yes' : 'No',
      'Today High': report.today.high,
      'Today Low': report.today.low,
      'Precipitation': report.today.precipitation,
      'Max Wind': report.today.maxWind,
      'Forecast': report.today.condition,
    };
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  🌍  Weather Report — ${report.city}, ${report.country}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.table(reportSummary);
    console.log('═══════════════════════════════════════════════════════════');
    await attachToAllure('Weather Report Summary', reportSummary);
  });
}

/**
 * Attach JWT token validation response
 * @param {Object} result - JWT validation result
 * @param {String} tokenType - Type of token (Valid, Expired, Tampered, Missing)
 */
async function displayJWTResponse(result, tokenType) {
  await test.step(`🔐 JWT ${tokenType} Token Response`, async () => {
    const jwtResponse = {
      'Status': result.status,
      'Authenticated': result.status === 200 ? 'Yes' : 'No',
      'Error': result.error || 'None',
      'User ID': result.user?.userId || 'N/A',
      'User Role': result.user?.role || 'N/A',
    };
    
    console.log('───────────────────────────────────────────────────────────');
    console.log(`JWT ${tokenType} Token Response:`);
    console.table(jwtResponse);
    console.log('───────────────────────────────────────────────────────────');
    await attachToAllure(`JWT ${tokenType} Token Response`, jwtResponse);
  });
}

/**
 * Attach detailed validation results
 * @param {Array} validations - Array of validation results
 */
async function displayValidationResults(validations) {
  await test.step('✅ Validation Results', async () => {
    console.log('\n───────────────────────────────────────────────────────────');
    console.log('VALIDATION RESULTS:');
    console.log('───────────────────────────────────────────────────────────');
    
    validations.forEach((validation, index) => {
      const status = validation.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${status} - ${validation.name}`);
      if (validation.details) {
        console.log(`   Details: ${validation.details}`);
      }
    });
    
    console.log('───────────────────────────────────────────────────────────\n');
    await attachToAllure('Validation Results', validations);
  });
}

/**
 * Attach API request/response pair
 * @param {String} endpoint - API endpoint
 * @param {Object} requestData - Request payload
 * @param {Object} responseData - Response data
 * @param {Number} statusCode - HTTP status code
 */
async function displayAPITransaction(endpoint, requestData, responseData, statusCode) {
  await test.step(`🔄 API Request/Response - ${endpoint}`, async () => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`📤 REQUEST: ${endpoint}`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(JSON.stringify(requestData, null, 2));
    
    console.log('\n📥 RESPONSE (Status: ' + statusCode + ')');
    console.log('───────────────────────────────────────────────────────────');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('═══════════════════════════════════════════════════════════\n');
    await attachToAllure(`API Transaction - ${endpoint}`, {
      request: requestData,
      response: responseData,
      statusCode,
    });
  });
}

export {
  attachResponseData,
  displayWeatherReport,
  displayJWTResponse,
  displayValidationResults,
  displayAPITransaction,
};
