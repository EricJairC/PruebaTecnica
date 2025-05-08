import jwt from 'jsonwebtoken'
import Usuario from '../models/User.model'

type UsuarioPayload = {
    id: Usuario['idUsuario']
}

export const generateJWT = (payload: UsuarioPayload) => {
    const token = jwt.sign( payload, process.env.JWT_SECRET, {
        expiresIn: '180d'
    })
    return token
}