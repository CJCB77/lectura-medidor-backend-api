//Conexion a la base de datos
const db = require('../database/connection');

const getViviendas = async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM vivienda");
        res.json(result.rows);
    }catch(err){
        console.log(err);
    }
}

const createVivienda = async (req, res) => {
    const {codigo,direccion,mz,villa} = req.body;
    try{
        const query = `INSERT INTO vivienda (codigo, direccion, mz, villa) 
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await db.query(query, [codigo,direccion,mz,villa]);
        res.json({"Message":"Vivienda agregada","vivienda":result.rows[0]});
    }
    catch(err){
        console.log(err);
    }
}

const getViviendaById = async (req, res) => {
    const {id} = req.params;
    try{
        const result = await db.query('SELECT * FROM vivienda WHERE id = $1', [id]);
        res.json(result.rows[0]);
    }
    catch(err){
        console.log(err);
    }
}

const updateVivienda = async (req, res) => {
    const {codigo} = req.params;
    const {direccion,mz,villa} = req.body;
    try{
        const query = `UPDATE vivienda SET direccion = $1, mz = $2, villa = $3 WHERE codigo = $4`;
        await db.query(query, [direccion,mz,villa,codigo]);
        res.json({"Message":"Vivienda actualizada"});
    }
    catch(err){
        console.log(err);
    }
}

const deleteVivienda = async (req, res) => {
    const {id} = req.params;
    try{
        const query = `DELETE FROM vivienda WHERE id = $1`;
        await db.query(query, [id]);
        res.json({"Message":"Vivienda eliminada"});
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {
    getViviendas,
    createVivienda,
    getViviendaById,
    updateVivienda,
    deleteVivienda
}