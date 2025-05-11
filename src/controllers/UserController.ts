import type { Request, Response } from 'express'
import Token from '../models/Token.model'
import Usuario from '../models/User.model'
import { checkpassword, hashpassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { DateTime } from 'luxon'
import { generateJWT } from '../utils/jwt'
import path from 'path'

export class UserController {
    static createAccount = async (req : Request, res : Response) => {
        try {
            const { usuarioPassword, usuarioEmail } = req.body
            // Verificar duplicados
            const userExist = await Usuario.findOne({
                where: { usuarioEmail }
            })
            if(userExist){
                const error = new Error('El usuario ya está registrado')
                res.status(409).json({error: error.message})
                return 
            }
            // Crea el usuario
            const user = new Usuario(req.body)
            // Hash usuarioPassword
            user.usuarioPassword = await hashpassword(usuarioPassword)
            await user.save()
            // Generando token
            const token = new Token()
            token.token = generateToken()
            // Relacionamos el id usuario con el usuario del token
            token.idUsuario = user.idUsuario
            await token.save()
            AuthEmail.sendConfirmationEmail({
                email: user.usuarioEmail,
                name: user.usuarioNombre,
                token: token.token
            })
            res.send('Cuenta creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ where: { token } })

            // Comprobamos que el token exista
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message})
            }

            const tokenCreado = DateTime.fromJSDate(tokenExists.createdAt)
            const fechaActual = DateTime.now()
            const expirado = fechaActual.diff(tokenCreado, "minutes").minutes > 10

            // Verificamos que no haya expirado
            if (expirado) {
                await tokenExists.destroy()
                res.status(400).json({ error: "Token expirado" })
            }

            const user = await Usuario.findByPk(tokenExists.idUsuario)
            user.confirmado = true

            const admin = await Usuario.findOne({
                where: { confirmado: true, admin: true }
            });

            if (!admin) {
                user.admin = true;
            }

            await user.save()
            await tokenExists.destroy()
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            
            const { usuarioEmail, usuarioPassword } = req.body
            const user = await Usuario.findOne({
                where: { usuarioEmail }
            })
            // Verificamos que existe el correo
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message})
            }
            if(!user.confirmado){
                const token = new Token()
                token.idUsuario = user.idUsuario
                token.token = generateToken()
                await token.save()

                AuthEmail.sendConfirmationEmail({
                    email: user.usuarioEmail,
                    name: user.usuarioNombre,
                    token: token.token
                })
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación')
                res.status(404).json({ error: error.message})
            }

            // Revisamos usuarioPassword
            const ispasswordCorrect = await checkpassword(usuarioPassword, user.usuarioPassword)

            // En caso de que no sea correcto
            if(!ispasswordCorrect){
                const error = new Error('password incorrecto')
                res.status(404).json({ error: error.message})
            }

            // Instanciamos el JWT
            const token = generateJWT({id: user.idUsuario})

            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static requestConfirmationCode = async (req : Request, res : Response) => {
        try {
            const { usuarioEmail } = req.body
            // Usuario existente
            const user = await Usuario.findOne({
                where: { usuarioEmail }
            })
            if(!user){
                const error = new Error('El usuario no está registrado')
                res.status(404).json({error: error.message})
                return 
            }
            if(user.confirmado){
                const error = new Error('El usuario ya está confirmado')
                res.status(403).json({error: error.message})
                return 
            }
            // Generando token
            const token = new Token()
            token.token = generateToken()
            // Relacionamos el id usuario con el usuario del token
            token.idUsuario = user.idUsuario
            await token.save()
            AuthEmail.sendConfirmationEmail({
                email: user.usuarioEmail,
                name: user.usuarioNombre,
                token: token.token
            })
            res.send('Se envió un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotpassword = async (req : Request, res : Response) => {
        try {
            const { usuarioEmail } = req.body
            // Usuario existente
            const user = await Usuario.findOne({
                where: { usuarioEmail }
            })
            if(!user){
                const error = new Error('El usuario no está registrado')
                res.status(404).json({error: error.message})
                return 
            }
            
            // Generando token
            const token = new Token()
            token.token = generateToken()
            // Relacionamos el id usuario con el usuario del token
            token.idUsuario = user.idUsuario
            await token.save()
            AuthEmail.sendpasswordResetToken({
                email: user.usuarioEmail,
                name: user.usuarioNombre,
                token: token.token
            })
            res.send('Revisa tu e-mail para reestablecer la contraseña')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ where: { token } })

            // Comprobamos que el token exista
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message})
            }

            const tokenCreado = DateTime.fromJSDate(tokenExists.createdAt)
            const fechaActual = DateTime.now()
            const expirado = fechaActual.diff(tokenCreado, "minutes").minutes > 10

            // Verificamos que no haya expirado
            if (expirado) {
                await tokenExists.destroy()
                res.status(400).json({ error: "Token expirado" })
            }

            res.send('Token válido, define tu nuevo password')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatepasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { usuarioPassword } = req.body
            const tokenExists = await Token.findOne({ where: { token } })

            // Comprobamos que el token exista
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message})
                return
            }

            const tokenCreado = DateTime.fromJSDate(tokenExists.createdAt)
            const fechaActual = DateTime.now()
            const expirado = fechaActual.diff(tokenCreado, "minutes").minutes > 10

            // Verificamos que no haya expirado
            if (expirado) {
                await tokenExists.destroy()
                res.status(400).json({ error: "Token expirado" })
            }

            // Obtenemos la constraseña
            const user = await Usuario.findByPk(tokenExists.idUsuario)
            user.usuarioPassword = await hashpassword(usuarioPassword)
            await user.save()

            // Borramos el token una vez cambiada la contraseña
            await tokenExists.destroy()
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        // Buscar al primer usuario confirmado
        const primerConfirmado = await Usuario.findOne({
        where: { confirmado: true },
        order: [['idUsuario', 'ASC']]
        });

        const isAdmin = primerConfirmado?.idUsuario === req.user.idUsuario;

        res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const idUsuario = req.user.idUsuario
            const { usuarioNombre, usuarioAlias } = req.body
            const usuarioImagen = req.file?.filename
    
            const user = await Usuario.findByPk(idUsuario)
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' })
                return 
            }
    
            user.usuarioNombre = usuarioNombre
            user.usuarioAlias = usuarioAlias
            if (usuarioImagen) {
                user.usuarioImagen = `/public/uploads/${usuarioImagen}`
            }
            await user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatedCurrentUserpassword = async (req: Request, res: Response) => {
        try {
            const { current_password, usuarioPassword } = req.body
            
            const user = await Usuario.findByPk(req.user.idUsuario)

            const ispasswordCorrect = await checkpassword(current_password, user.usuarioPassword)

            if(!ispasswordCorrect){
                const error = new Error('El password actual es incorrecto')
                res.status(401).json({error: error.message})
                return
            }

            user.usuarioPassword = await hashpassword(usuarioPassword)
            await user.save()
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static checkpassword = async (req: Request, res: Response) => {
        try {
            const { usuarioPassword } = req.body

            const user = await Usuario.findByPk(req.user.idUsuario)

            const ispasswordCorrect = await checkpassword(usuarioPassword, user.usuarioPassword)

            if(!ispasswordCorrect){
                const error = new Error('El password es incorrecto')
                res.status(401).json({error: error.message})
                return
            }
            res.send('password correcto')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getAllUsers = async (req : Request, res: Response) => {
        try {    
            const usuarios = await Usuario.findAll({
                where: { confirmado: 1 },
                attributes: { exclude: ['usuarioPassword', 'confirmado'] },
            });
    
            res.json(usuarios);

        } catch (error) {
            res.status(500).json({ error: 'Error al obtener usuarios' });
        }
    }

    static getUserById = async (req : Request, res: Response) => {
        try {
            const idUsuario = +req.params.idUsuario
            const usuario = await Usuario.findByPk(idUsuario, {
                attributes: { exclude: ['usuarioPassword', 'confirmado'] },
            });

            res.json(usuario);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener usuario' });
        }
    }

    // Actualizar un usuario
    static updatedUser = async (req : Request, res: Response) => {
        try {
            const { idUsuario } = req.params;

            const idAdministrador = +req.user.idUsuario

            const usuarioImagen = req.file?.filename

            const user = await Usuario.findByPk(idUsuario);

            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return
            }

            const primerUsuarioConfirmado = await Usuario.findOne({
                where: { confirmado: true },
                order: [['idUsuario', 'ASC']],
            });

            if(idAdministrador === +idUsuario || primerUsuarioConfirmado){
                if (usuarioImagen) {
                    user.usuarioImagen = `/uploads/${usuarioImagen}` 
                }
                await user.update({
                    ...req.body,
                    ...(usuarioImagen && { usuarioImagen: `/uploads/${usuarioImagen}` })
                });
                res.json('Usuario actualizado correctamente')
                return
            }

            const error = new Error('Solo el manager puede actualizar el usuario')
            res.status(404).json({error: error.message})
            return
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    }
}
