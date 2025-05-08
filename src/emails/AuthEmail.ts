import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async( user : IEmail ) => {
        try {
            await transporter.sendMail({
                from: 'Gestor de usuarios <enviocorreos010@gmail.com>',
                to: user.email,
                subject:  'Gestor de usuarios - Confirma tu cuenta',
                text: 'Gestor de usuarios - Confirma tu cuenta',
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
                        <h2 style="text-align: center; color: #f97316;">Gestor de usuarios</h2>
                        <p style="font-size: 16px; color: #333;">Hola <b>${user.name}</b>,</p>
                        <p style="font-size: 16px; color: #333;">Has creado tu cuenta en <b>Gestor de usuarios</b>. Solo debes confirmar tu cuenta para empezar a usarla.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/auth/confirm-account" 
                               style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                               Confirmar cuenta
                            </a>
                        </div>
                        <p style="font-size: 16px; color: #333;">O ingresa el siguiente código en la aplicación:</p>
                        <p style="font-size: 24px; text-align: center; font-weight: bold; color: #f97316;">${user.token}</p>
                        <p style="font-size: 12px; color: #999; text-align: center;">Este token expira en 10 minutos.</p>
                    </div>
                `
            })
            console.log('Correo enviado correctamente');
        } catch (error) {
            console.error('Error al enviar correo:', error);
        }
    }

    static sendpasswordResetToken = async( user : IEmail ) => {
        await transporter.sendMail({
            from: 'Gestor de usuarios <enviocorreos010@gmail.com>',
            to: user.email,
            subject:  'Gestor de usuarios - Restablece tu password',
            text: 'Gestor de usuarios - Restablece tu password',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
                    <h2 style="text-align: center; color: #f97316;">Gestor de usuarios</h2>
                    <p style="font-size: 16px; color: #333;">Hola <b>${user.name}</b>,</p>
                    <p style="font-size: 16px; color: #333;">Has solicitado restablecer tu contraseña. Sigue el siguiente enlace para crear una nueva:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/auth/new-password" 
                           style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                           Restablecer contraseña
                        </a>
                    </div>
                    <p style="font-size: 16px; color: #333;">O ingresa el siguiente código en la aplicación:</p>
                    <p style="font-size: 24px; text-align: center; font-weight: bold; color: #f97316;">${user.token}</p>
                    <p style="font-size: 12px; color: #999; text-align: center;">Este token expira en 10 minutos.</p>
                </div>
            `
        })
    }
}