import { Sequelize } from 'sequelize-typescript'
import dotenv from 'dotenv'

dotenv.config()

// Conexion POSTGRESS
// const db = new Sequelize(process.env.DATABASE_URL!, {
//     models: [__dirname + '/../models/**/*'],
//     logging: false
// })

// Conexion SQLSERVER
const db = new Sequelize(process.env.DATABASE, process.env.USERNAME_DB, process.env.password_DB, {
    host: process.env.HOST_DB,
    dialect: 'mssql',
    models: [__dirname + '/../models/**/*.ts'],
    logging: false
})


export default db