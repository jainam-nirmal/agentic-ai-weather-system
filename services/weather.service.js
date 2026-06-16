import axios from "axios"


class WeatherService{

  

       async getWeather(latitude, longitude) { 
        try 
            {
             const url = `${process.env.WEATHER_API_BASE_URL}/v1/forecast`;

             const response = await axios.get(url,{
                params:{
                    latitude,
                    longitude,
                    current: [ 'temperature_2m', 
                                'relative_humidity_2m', 
                                'wind_speed_10m', 
                                'weather_code' 
                            ].join(','), 
                    timezone: 'auto'
                },

                timeout:process.env.REQUEST_TIMEOUT
             })

             const current = response.data.current;

             console.log("*********** current logs response ********************")
             console.log(JSON.stringify(current, null, 2))
             console.log("*********** current logs response ********************")
             return { 
                temperature: current.temperature_2m, 
                humidity: current.relative_humidity_2m, 
                windSpeed: current.wind_speed_10m, 
                weatherCode: current.weather_code

               }
            
          } catch (error) { 
             throw new Error( `Weather API Error: ${error.message}` );

                }
            }

            getWeatherCondition(weatherCode){
                const weatherMap = {

                     0: 'Clear Sky', 
                     1: 'Mainly Clear', 
                     2: 'Partly Cloudy', 
                     3: 'Overcast', 
                     45: 'Fog', 
                     48: 'Depositing Fog', 
                     51: 'Light Drizzle', 
                     53: 'Moderate Drizzle', 
                     55: 'Dense Drizzle', 
                     61: 'Light Rain', 
                     63: 'Moderate Rain', 
                     65: 'Heavy Rain', 
                     71: 'Light Snow', 
                     80: 'Rain Showers', 
                     95: 'Thunderstorm'
                }

                return ( weatherMap[weatherCode] || 'Unknown Weather' );
            }

}

export default new WeatherService();