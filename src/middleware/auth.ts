import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import Usuario from "../models/User.model"

declare global {
    namespace Express {
        interface Request {
            user?: Usuario
        }
    }
}

export const authenticate = async (req : Request, res : Response, next : NextFunction) => {
    const bearer = req.headers.authorization
    if(!bearer){
        const error = new Error('No autorizado')
        res.status(401).json({error: error.message})
    }
    const token = bearer.split(' ')[1]

    try {
        // Verificamos el JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(typeof decoded === 'object' && decoded.id){
            // En caso de existir el usuario
            const user = await Usuario.findByPk(decoded.id, {
                // Excluimos el password para no filtrar informacion
                attributes: {exclude: ['password']}
            })
            // Guardamos el usuario en el request
            if(user){
                req.user = user
            }else{
                res.status(500).json({error: 'Token no válido'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no válido'})
    }
    next()
}