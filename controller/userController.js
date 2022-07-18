const bcrypt = require('bcrypt');
//Get db connection
const db = require('../database/connection');



const listarUsuarios = async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM usuario");
        res.json(result.rows);
    }
    catch(err){
        console.log(err);
    }
}

const updateUsuario = async (req, res) => {
    const {id} = req.params;
    const {username,password,role} = req.body;
    //Encriptar password
    const password_hash = bcrypt.hashSync(password, 10);

    try{
        const result = await db.query(`UPDATE usuario SET username = $1, password = $2, role = $3 WHERE id = $4`, [username,password_hash,role,id]);
        res.json({"Message": "Usuario Actualizado", "Usuario": result.rows[0]});
    }
    catch(err){
        console.log(err);
    }
}

const eliminarUsuario = async (req, res) => {
    const {id} = req.params;
    try{
        const result = await db.query("DELETE FROM usuario WHERE id = $1", [id]);
        res.json({"Message": "Usuario Eliminado"});
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {
    listarUsuarios,
    eliminarUsuario,
    updateUsuario
}