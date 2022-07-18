const db = require('../database/connection');
const userSchema = require('../validation/userSchema');
const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');


const login = async (req, res) => {
    const {username,password} = req.body;

    //Verify encrypted password
    const query = `SELECT * FROM usuario WHERE username = $1`;
    const result = await db.query(query, [username]);
    if(result.rows.length === 0){
        return res.status(400).json({
            "Message":"El usuario no existe",
            "loggedIn":false
        });
    }
    const user = result.rows[0];
    const isMatch = await bcript.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({
            "Message":"La contraseña es incorrecta",
            "loggedIn":false
        });
    }
    //Generar token
    const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {expiresIn:'1h'});
    res.json({
        "message":"Login correcto",
        "token":token,
        "role":user.role,
        "username":user.username,
        "userId":user.id,
        "loggedIn":true
    });

}

const register = async (req, res) => {
    const {username,password,role} = req.body;

    //Validar los datos antes de ingresarlos
    const {error} = userSchema.validate({username,password,role});
    if(error){
        res.status(400).json({"Message":error.details[0].message});
        return;
    }
    
    //Verificar si el usuario ya existe
    const query = `SELECT * FROM usuario WHERE username = $1`;
    const result = await db.query(query, [username]);
    if(result.rows.length > 0){
        res.status(400).json({"Message":"El usuario ya existe"});
        return;
    }

    //Encriptar contraseña
    const salt = await bcript.genSalt(10);
    const hashed_password = await bcript.hash(password, salt);

    try{
        const query = `INSERT INTO usuario (username, password, role) VALUES ($1, $2, $3)`;
        await db.query(query, [username,hashed_password,role]);
        res.json({"Message":`Usuario ${username} registrado`, "role":role, "username":username, "password":hashed_password});

    } catch(err){
        console.log(err);
    }
}

module.exports = {
    login,
    register
}
