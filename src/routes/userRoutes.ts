import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middleware/validation'
import { authenticate } from '../middleware/auth'
import { upload } from '../config/upload'

const router = Router()

// Crear usuario
router.post('/create-account', 
    body('usuarioNombre')
        .notEmpty().withMessage('El nombre no puede ir vacío'),
    body('usuarioAlias')
        .notEmpty().withMessage('El nombre no puede ir vacío'),    
    body('usuarioPassword')
        .isLength({min: 8}).withMessage('El password es muy corto, mínimo 8 caracteres'),
    body('password_confirmation')
        .custom((value, {req}) => {
            if(value !== req.body.usuarioPassword){
                throw new Error('Los passwords no son iguales')
            }
            return true
        }),
    body('usuarioEmail')
        .isEmail().withMessage('E-mail no válido'),
        handleInputErrors,
    UserController.createAccount
)

// Confirmar cuenta
router.post('/confirm-account',
    body('token')
        .notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    UserController.confirmAccount
)

// Loggearse
router.post('/login',
    body('usuarioEmail')
        .isEmail().withMessage('E-mail no válido'),
    body('usuarioPassword')
        .notEmpty().withMessage('El password no puede ir vacío'),
    handleInputErrors,
    UserController.login
)

// Solicitar un código
router.post('/request-code',
    body('usuarioEmail')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    UserController.requestConfirmationCode
)

// Recuperación de cuenta
router.post('/forgot-password',
    body('usuarioEmail')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    UserController.forgotpassword
)

// Validación de token
router.post('/validate-token',
    body('token')
        .notEmpty().withMessage('El token no puede ir vacío'),
    handleInputErrors,
    UserController.validateToken
)

// Actualizar password desde la app
router.post('/update-password/:token',
    param('token')
        .isNumeric().withMessage('Token no válido'),
    body('usuarioPassword')
        .isLength({min: 8}).withMessage('El password es muy corto, mínimo 8 caracteres'),
    body('password_confirmation')
        .custom((value, {req}) => { 
            if(value !== req.body.usuarioPassword){
                throw new Error('Los passwords no son iguales')
            }
            return true
        }),
    handleInputErrors,
    UserController.updatepasswordWithToken
)

// Saber si el usuario está autenticado
router.get('/user',
    authenticate,
    handleInputErrors,
    UserController.user
)

// Actualizar perfil
router.patch('/profile',
    authenticate,
    body('usuarioNombre')
        .notEmpty().withMessage('El nombre no puede ir vacío'),
    body('usuarioAlias')
        .notEmpty().withMessage('El nombre no puede ir vacío'),
    handleInputErrors,
    UserController.updateProfile
)

// Actualizar contraseña
router.post('/updated-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('El password actual no puede ir vacío'),
    body('usuarioPassword')
        .isLength({min: 8}).withMessage('El password es muy corto, mínimo 8 caracteres'),
    body('password_confirmation')
        .custom((value, {req}) => { 
            if(value !== req.body.usuarioPassword){
                throw new Error('Los passwords no son iguales')
            }
            return true
        }),
    handleInputErrors,
    UserController.updatedCurrentUserpassword
)

// Verificar password
router.post('/check-password',
    authenticate,
    body('usuarioPassword')
        .notEmpty().withMessage('El password no puede ir vacío'),
    handleInputErrors,
    UserController.checkpassword
)

// Visualizar usuarios
// Obtener todos los proyectos
router.get('/', 
    UserController.getAllUsers
)

// Obtener un usuario por id
router.get('/user/:idUsuario', 
    authenticate,
    param('idUsuario')
        .isNumeric().withMessage('Token no válido'),
    UserController.getUserById
)

// Editar usuario
router.patch('/user/:idUsuario',
    authenticate,
    upload.single('imagen'), 
    param('idUsuario')
        .isInt().withMessage('Id no válido'),
    body('usuarioNombre')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacío'),
    body('usuarioAlias')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacío'),
    handleInputErrors,
    UserController.updatedUser
)



export default router