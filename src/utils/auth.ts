import bcrypt from 'bcrypt'

export const hashpassword = async (password : string) => {
    // Hash password
    const salt = await bcrypt.genSalt(10) //Genera un valor único a cada contraseña
    return await bcrypt.hash(password, salt)   
}

export const checkpassword = async (enteredpassword : string, storedHash: string) => {
    return await bcrypt.compare(enteredpassword, storedHash)
}