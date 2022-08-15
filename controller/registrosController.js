const axios = require('axios').default;
const {uploadFile} = require('../database/s3');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

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
        const query = `SELECT registro.id,registro.ult_registro, registro.codigo_vivienda, imagen, imagen_procesada, lectura,
        registro.fecha_creacion, gps, usuario.username, direccion,mz,villa
        FROM registro
        JOIN tareas ON registro.id_tarea = tareas.id
        JOIN usuario ON tareas.id_usuario = usuario.id
        JOIN vivienda ON registro.codigo_vivienda = vivienda.codigo
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

const getLecturaImagen = async (req, res) => {
    const file = req.file;
    console.log(file);
    //Subir archivo a S3
    const bucketResult = await uploadFile(file)
    //Unlink file
    await unlinkFile(file.path);
    console.log(bucketResult);
    const imagen =  bucketResult.Location
    console.log(imagen);
    try{
        const result = await axios.post('https://procesamiento-vision-medidor.herokuapp.com/filter', {
            image: imagen});
        processedImage = result.data.url;
        console.log(processedImage);
        res.json({processedImage, imagen});
        
    }catch(err){
        console.log(err);
    }
}

const createRegistro = async (req, res) => {
   
    const {id_tarea,gps,codigo_vivienda,imagen,imagen_procesada,lectura} = req.body;
    let ultimoRegistro = null
    try{
        let query = `SELECT DISTINCT ON(fecha_creacion) fecha_creacion,id, codigo_vivienda,lectura
        FROM registro
        WHERE codigo_vivienda='${codigo_vivienda}'
        ORDER BY fecha_creacion DESC;`;
        const result = await db.query(query);
        ultimoRegistro = result.rows[0].id;
    }
    catch(err){
        console.log(err);
    }
    try{
        const result = await db.query(`INSERT INTO registro 
            (id_tarea, codigo_vivienda, imagen,lectura, gps,imagen_procesada,ult_registro) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) Returning * `, 
            [id_tarea, codigo_vivienda, imagen,lectura, gps, imagen_procesada, ultimoRegistro]);
        res.json({"Message": "Registro Creado", "Registro": result.rows[0]});
    }
    catch(err){
        console.log(err);
    }
    try{
        await db.query(`UPDATE tareas 
            SET completada = $1 WHERE id = $2`, 
            [true, id_tarea]);
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
            SET id_usuario = $1, imagen = $2, lectura = $3, gps = $4, codigo_vivienda = $5, ult_registro = $5
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
    deleteRegistro,
    getLecturaImagen
}
