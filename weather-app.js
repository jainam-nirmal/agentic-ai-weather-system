import "dotenv/config";
import readlineSync from "readline-sync";
import WeatherAgent from "./agents/weatherAgents.js";
import logger from "./utils/logger.js";

async function startApplication() {
    const weatherAgent = new WeatherAgent();

    try {
        const cityName = readlineSync.question("For which city do you want weather information ?:");

        await weatherAgent.launchAgent();
        const isValidCity = await weatherAgent.validateCity(cityName);

        if (!isValidCity) {
            logger.error("Invalid city enter . Please enter valid city name ");
            return;
        }
        logger.success("Weather Agent Ready ...");
        const weatherDetails = await weatherAgent.getWeatherDetails(cityName);

        console.log('\n=================================');
        console.log(`CITY NAME: ${weatherDetails.city.toUpperCase()}`);
        console.log('\n=================================');
        console.log(`Country: ${weatherDetails.country}`);  
        console.log(`State: ${weatherDetails.state ?? 'N/A'}`);
        console.log(`Temperature: ${weatherDetails.temperature}°C`);
        console.log(`Humidity: ${weatherDetails.humidity}%`);
        console.log(`Wind Speed: ${weatherDetails.windSpeed} km/h`);
        console.log(`Weather Condition: ${weatherDetails.weatherCondition}`);

        logger.info('Generating AI travel advice (this may take up to a minute)...');
        const aiAnalysis = await weatherAgent.analyzeWeather(weatherDetails);

        console.log('\n=================================');
        console.log('AI TRAVEL ADVICE');
        console.log('=================================');
        console.log(aiAnalysis);
        console.log('\n=================================');

       
    } catch (error) {
        logger.error(`Application Error : ${error.message}`);
    } finally {
        await weatherAgent.closeAgent();
    }
}

startApplication();
