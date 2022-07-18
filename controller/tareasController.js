//Conexion con la base de datos
const db = require('../database/connection');

const getTareas = async (req, res) => {

    //Create query for id_usuario
    const user_id = req.query.id;
    const username = req.query.username;
    console.log(user_id);
    if(user_id){
        try{
            const result = await db.query(`SELECT * FROM tareas WHERE id_usuario = $1`, [user_id]);
            return res.json(result.rows);
        }
        catch(err){
            console.log(err);
        }
    }

    if(username){
        try{
            const query = `SELECT tareas.id, titulo, descripcion, tareas.fecha_creacion, username 
                FROM tareas JOIN usuario ON usuario.id = id_usuario ORDER BY tareas.fecha_creacion DESC;`;
            const result = await db.query(query);
            return res.json(result.rows);
        }
        catch(err){
            console.log(err);
        }
    }

    try {
        const result = await db.query('SELECT * FROM tareas');
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
    }
}

const createTarea = async (req, res) => {
    const {usuario,titulo,descripcion} = req.body;
    console.log(usuario);
    let id_usuario = null
    //Get usuario id from database
    try{
        const query = `SELECT id FROM usuario WHERE username = $1`;
        const result = await db.query(query, [usuario]);
        id_usuario = result.rows[0].id;
    }catch(err){
        console.log(err);
    }
    try{
        //Create new tarea
        const query2 = `INSERT INTO tareas (id_usuario, titulo, descripcion) VALUES ($1, $2, $3) RETURNING *`;
        const result2 = await db.query(query2, [id_usuario,titulo,descripcion]);
        res.status(200).json({"Message":"Tarea creada","tarea":result2.rows[0]});
    }catch(err){
        console.log(err);
    }
}
    

const getTareaById = async (req, res) => {
    const {id} = req.params;
    try {
       const result = await db.query('SELECT * FROM tareas WHERE id = $1', [id]);
       res.status(200).json(result.rows[0]);
    } catch (err) {
        console.log(err);
    }
}

const updateTarea = async (req, res) => {
    const {id} = req.params;
    const {titulo,descripcion} = req.body;
    try {
        const query = `UPDATE tareas SET titulo = $1, descripcion = $2 WHERE id = $3 RETURNING *`;
        const result = await db.query(query, [titulo,descripcion,id]);
        res.status(200).json({"Message":"Tarea actualizada","tarea":result.rows[0]});
    } catch (err) {
        console.log(err);
    }
}

const deleteTarea = async (req, res) => {
    const {id} = req.params;
    try {
        const query = `DELETE FROM tareas WHERE id = $1`;
        await db.query(query, [id]);
        res.status(200).json({"Message":"Tarea eliminada"});
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    getTareas,
    createTarea,
    getTareaById,
    updateTarea,
    deleteTarea
}
