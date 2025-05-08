import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    // Origin es de donde viene la petición y callback lo que permite la conexión
    origin: function(origin, callback){
        const whiteList = [process.env.FRONTEND_URL]
        // Permitimos la conexion para probar la api y ejecutar el servidor
        if(process.argv[2] === '--api'){
            whiteList.push(undefined)
        }
        if(whiteList.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error('Error de CORS'))
        }
    }
}