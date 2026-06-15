import ollama from "ollama"


class OllamaService {

   async analzyeWeather(prompt)
   {
    try{
        const response = await ollama.chat({
                model: process.env.OLLAMA_MODEL ,
                messages: [ {
                    role : 'user',
                    content:prompt
                    }]
        })

        return response.message.content;
    } catch(error){
        throw new Error(`Ollama error : ${error.message} `)
    }
   }
}

export default new OllamaService()

















