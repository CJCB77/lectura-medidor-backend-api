const axios = require('axios').default;

//Get db connection
const db = require('../database/connection');

const getRegistros = async (req, res) => {
    
    // Add user id parameter to the query
    user_id = req.query.id;

    if(user_id){
        try{
            const result = await db.query(`SELECT * FROM registro WHERE id_usuario = $1 ORDER BY fecha_creacion DESC`, [user_id]);
            return res.json(result.rows);
        }
        catch(err){
            console.log(err);
        }
    }

    
    try{
        const result = await db.query("SELECT * FROM registro");
        res.json(result.rows);
    }catch(err){
        console.log(err);
    }
};

const getRegistroCompleto = async (req, res) => {
    try{
        const query = `SELECT registro.id, registro.codigo_vivienda, usuario.username,lectura,
        registro.fecha_creacion,vivienda.direccion,vivienda.mz,vivienda.villa,imagen,
        gps
        FROM registro 
        JOIN vivienda ON codigo_vivienda = vivienda.codigo
        JOIN usuario ON registro.id_usuario = usuario.id
        ORDER BY registro.fecha_creacion DESC;`;

        const result = await db.query(query);
        res.json(result.rows);
    }
    catch(err){
        console.log(err);
    }
}

const getRegistroById = async (req, res) => {
    const {id} = req.params;
    try{
        const result = await db.query("SELECT * FROM registro WHERE id = $1", [id]);
        res.json(result.rows[0]);
    }
    catch(err){
        console.log(err);
    }
}

const createRegistro = async (req, res) => {
    var lectura = 0;
    let imagen = "http://localhost:3000/" + req.file.path;
    console.log(imagen);
    const {id_usuario,gps,codigo_vivienda} = req.body;
    //Make axios post imagen to http://localhost:8000/read TRY CATCH
    try{
        const result = await axios.post('http://localhost:8000/read', {
            image: imagen});
        lectura = result.data.lectura;
    }
    catch(err){
        console.log(err);
    }       
    try{
        const result = await db.query(`INSERT INTO registro 
            (id_usuario, codigo_vivienda, imagen,lectura, gps) 
            VALUES ($1, $2, $3, $4, $5) Returning * `, 
            [id_usuario, codigo_vivienda, imagen,lectura, gps]);
        res.json({"Message": "Registro Creado", "Registro": result.rows[0]});
    }
    catch(err){
        console.log(err);
    }
}

const updateRegistro = async (req, res) => {
    const {id} = req.params;
    const {id_usuario,imagen,lectura,gps,codigo_vivienda} = req.body;
    try{
        const result = await db.query(`UPDATE registro 
            SET id_usuario = $1, imagen = $2, lectura = $3, gps = $4, codigo_vivienda = $5
            WHERE id = $6 RETURNING *`, 
            [id_usuario,imagen, lectura, gps, codigo_vivienda, id]);
        res.json({"Message": "Registro Actualizado", "Registro": result.rows[0]});
    }catch(err){
        console.log(err);
    }
}

const deleteRegistro = async (req, res) => {
    const {id} = req.params;
    try{
        await db.query("DELETE FROM registro WHERE id = $1", [id]);
        res.status(200).json({"Message": "Registro Eliminado"});
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {
    getRegistros,
    getRegistroCompleto,
    getRegistroById,
    createRegistro,
    updateRegistro,
    deleteRegistro
}
