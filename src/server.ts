import express from "express";
import db from "./config/db";
import colors from 'colors'
import cors from 'cors'
import { corsConfig } from "./config/cors";
import morgan from "morgan";
import userRoutes from './routes/userRoutes'
import path from "path";

// Conectando a la base de datos
async function connectDB(){
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.magenta.bold('Conexion exitosa a la BD'))
        
    } catch (error) {
        console.log(colors.red.bold(error))
    }
}

connectDB()

const app = express()

// Permitimos la conexion con cors
app.use(cors(corsConfig))

// Usando morgan 
app.use(morgan('dev'))

// Habilitamos la lectura json
app.use(express.json())

// Router de usuarios
app.use('/api/auth', userRoutes)

// Router para imagenes
app.use('/uploads', express.static(path.join(__dirname, '..', 'dist', 'public', 'uploads')));

export default app