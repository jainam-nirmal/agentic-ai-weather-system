import { chromium } from "playwright";
import Validator from "../utils/validator.js";
import Logger from "../utils/logger.js";
import messages from "../constants/messages.js";

import geoCodingService from "../services/geocoding.service.js";
import weatherService from "../services/weather.service.js";
import weatherPrompt from "../prompts/weather.prompt.js"
import ollamaService from "../services/ollama.service.js"



class WeatherAgent {

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async launchAgent() {
        Logger.info(messages.APP_START);
        this.browser = await chromium.launch({ headless:true});

        const context = await this.browser.newContext();
        this.page = await context.newPage();

        //Logger.success("Browser launched successfully");
    }

    async validateCity(cityName) {
        try {
            Logger.info(messages.CITY_VALIDATION);
            Validator.validCity(cityName);
            await this.page.goto(`https://www.google.com/search?q=${cityName}+weather`, {
                waitUntil: "domcontentloaded",
            });
            const pageTitle = await this.page.title();

           

            if (!pageTitle.toLowerCase().includes(cityName.toLowerCase())) {
                Logger.error(`City validation failed: ${cityName} is not a valid city`);
                return false;
            }

            Logger.success(messages.CITY_SUCESS);
            return true;
        } catch (error) {
            Logger.error(`City validation failed: ${error.message}`);
            return false
        }
    }


    async getWeatherDetails(cityName){
        try { 
            Logger.info( 'Fetching weather information...' );
            const cityCoordinates = await geoCodingService.getCordinates(cityName);
            const weatherDetails = await weatherService.getWeather( cityCoordinates.latitude, cityCoordinates.longitude );
            return { 
                city: cityCoordinates.city, 
                country: cityCoordinates.country, 
                temperature: weatherDetails.temperature, 
                humidity: weatherDetails.humidity,
                windSpeed: weatherDetails.windSpeed, 
                weatherCondition: weatherService.getWeatherCondition( weatherDetails.weatherCode )
            };
        } catch(error) {
            throw new Error( error.message );
        }
    }

    async analyzeWeather(weatherData) {
        Logger.info('Analyzing weather with AI...');
        const prompt = weatherPrompt.buildPrompts(weatherData);
        const analysis = await ollamaService.analzyeWeather(prompt);
        Logger.success('AI analysis complete.');
        return analysis;
    }

    async closeAgent() {
        if (this.browser) {
            await this.browser.close();
        }
        Logger.success(messages.AGENT_CLOSED);
    }
}

export default WeatherAgent;
