import axios from "axios";

class GeoCodingService{



    async getCordinates(cityName){

     try{

             const url = `${process.env.GEOCODING_API_BASE_URL}/v1/search`;
             const response = await axios.get(url,{
                params :{
                    name:cityName,
                    count:1
                },
                timeout:process.env.REQUEST_TIMEOUT

             })
             console.log("*********** getCordinates logs response ********************")
             console.log(`Get URL response ${JSON.stringify(response.data,null,2 )}`)
             console.log("*********** getCordinates logs response ********************")

            const cityData = response.data.results?.[0];

            if(!cityData)
            {
                throw new Error(`No cordinates found for the city : ${cityName}`)
            }

            return {

                city:cityData.name,
                latitude:cityData.latitude,
                longitude:cityData.longitude,
                country:cityData.country,
                state: cityData.admin1 || null,
            }

     }

     catch(error){
        throw new Error(`Geocoding Error:${error.message}`)
     }
    
    }

}

export default new GeoCodingService();