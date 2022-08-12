const db = require('../database/connection');

const getClientes = async (req,res) => {
    try{
        const result = await db.query("SELECT * FROM cliente");
        res.json(result.rows);
    }
    catch(err){
        console.log(err);
    }
}

const createCliente = async (req,res) => {
    const {nombres,apellidos,cedula,correo,celular} = req.body;
    try{
        const query = `INSERT INTO cliente (nombres, apellidos, cedula, correo, celular)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const result = await db.query(query, [nombres,apellidos,cedula,correo,celular]);
        res.json({"Message":"Cliente agregado","cliente":result.rows[0]});
    }
    catch(err){
        console.log(err);
    }
}

const updateCliente = async (req,res) => {
    const {id} = req.params;
    const {nombres,apellidos,cedula,correo,celular} = req.body;
    try{
        const query = `UPDATE cliente SET nombres = $1, apellidos = $2, cedula = $3, correo = $4, celular = $5 WHERE id = $6`;
        await db.query(query, [nombres,apellidos,cedula,correo,celular,id]);
        res.json({"Message":"Cliente actualizado"});
    }
    catch(err){
        console.log(err);
    }
}

const deleteCliente = async (req,res) => {
    const {id} = req.params;
    try{
        const query = `DELETE FROM cliente WHERE id = $1`;
        await db.query(query, [id]);
        res.json({"Message":"Cliente eliminado"});
    }
    catch(err){
        console.log(err);
    }
}




module.exports = {
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente
}
