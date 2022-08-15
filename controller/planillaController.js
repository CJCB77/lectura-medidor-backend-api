const db = require('../database/connection');
const PDFDocument = require('pdfkit');


async function calcularCosto(lectura, ult_registro){
    let costo = 0;
    let lectura_anterior = 0;
    try{
        const query = `SELECT lectura FROM registro WHERE id = $1`;
        const result = await db.query(query, [ult_registro]);
        lectura_anterior = result.rows[0].lectura;
    }catch(err){
        console.log(err);
    }
    energiaTotal = lectura - lectura_anterior;
    costo = energiaTotal * 0.09;
    //Format costo to 2 decimals
    costo = costo.toFixed(2);
 
    return {costo, energiaTotal};
}

const getPlanillas = async (req, res) => {
    try{
        const query = `SELECT planilla.id, valor, cliente.nombres, cliente.apellidos,cliente.cedula,
        planilla.codigo_vivienda, fecha_emision
        FROM planilla
        JOIN vivienda ON vivienda.codigo = planilla.codigo_vivienda
        JOIN cliente ON cliente.cedula = vivienda.id_cliente;`;
        const result = await db.query(query);
        res.json(result.rows);
    }catch(err){
        console.log(err);
    }
}

const createPlanilla = async (req, res) => {
    const {codigo, id_registro, lectura,ult_registro,fecha} = req.body;
    let costo = 0;
    let energiaTotal = 0;
    //Get only numeric parts from lectura
    let lectura_numerica = lectura.replace(/[^0-9]/g, '');
    //Format fecha to YYYY-MM-DD remove time
    let fecha_formateada = fecha.split(" ")[0];
    //Add 30 days to fecha_vencimiento
    let fecha_vencimiento = new Date(fecha_formateada);
    fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30);
    //Format fecha_vencimiento to DATE
    fecha_vencimiento = fecha_vencimiento.toISOString().split("T")[0];
    try{
        ({costo, energiaTotal} = await calcularCosto(lectura_numerica, ult_registro));
        const query = `INSERT INTO planilla (codigo_vivienda, id_registro, valor, fecha_vencimiento, energia_consumida)
        VALUES ($1, $2, $3, $4, $5) Returning *`;
        const result = await db.query(query, [codigo, id_registro, costo, fecha_vencimiento, energiaTotal]);
        res.json({"Message": "Planilla Creada", "Planilla": result.rows[0]});
        
    }catch(err){
        console.log(err);
    }
}

const updatePlanilla = async (req, res) => {
    const {id} = req.params;
    const {cedula, id_registro, valor,fecha_vencimiento} = req.body;
    try{
        const query = `UPDATE planilla SET cedula = $1, id_registro = $2, valor = $3,
            fecha_vencimiento = $4 WHERE id = $5 RETURNING *`;
        const result = await db.query(query, [cedula, id_registro, valor, fecha_vencimiento, id]);
        res.json({"Message": "Planilla Actualizada", "Planilla": result.rows[0]});
    }catch(err){
        console.log(err);
    }
}

const deletePlanilla = async (req, res) => {
    const {id} = req.params;
    try{
        const query = `DELETE FROM planilla WHERE id = $1`;
        const result = await db.query(query, [id]);
        res.json({"Message": "Planilla Eliminada"});
    }catch(err){
        console.log(err);
    }
}

const generarPdf = async (req, res) => {
    const {id} = req.params;
    let planilla = {};

    try{
        const query = `SELECT planilla.id, valor, cliente.nombres, cliente.apellidos,cliente.cedula,
        vivienda.direccion,vivienda.villa,vivienda.mz, planilla.fecha_emision, planilla.fecha_vencimiento, planilla.energia_consumida
        FROM planilla
        JOIN vivienda ON vivienda.codigo = planilla.codigo_vivienda
        JOIN cliente ON cliente.cedula = vivienda.id_cliente
        WHERE planilla.id = $1`;
        const result = await db.query(query, [id]);
        console.log(result.rows[0]);
        planilla = result.rows[0];
    }catch(err){
        console.log(err);
    }
    console.log(planilla);
    const nombreCompleto = planilla.nombres + " " + planilla.apellidos;
    const valor = planilla.valor;
    const consumoEnergia = planilla.energia_consumida;
    const direccion = planilla.direccion + " " + planilla.villa + " " + planilla.mz;
    const cedula = planilla.cedula;
    const fecha_emision = planilla.fecha_emision;
    const fechaEmisionFormatted = `${(fecha_emision.getMonth() + 1)}/${fecha_emision.getDate()}/${fecha_emision.getFullYear()}`;
    const fecha_vencimiento = planilla.fecha_vencimiento;
    const fechaVencimientoFormatted = `${(fecha_vencimiento.getMonth() + 1)}/${fecha_vencimiento.getDate()}/${fecha_vencimiento.getFullYear()}`;
 
    const doc = new PDFDocument({bufferPages: true});
    doc.fontSize(24);
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-disposition': `attachment; filename=${id}_planilla.pdf`
        });

    doc.on('data', (data) => {
        stream.write(data);
    }).on('end', () => {
        stream.end();
    }).on('error', (err) => {
        console.log(err);
    })

    doc.text('Planilla de Consumo', {
        underline: true
    });
    doc.moveDown();
    doc.text('Factura N°: ' + id)
    doc.moveDown();
    doc.text('Fecha de Emisión: ' + fechaEmisionFormatted)
    doc.moveDown();
    doc.text('Fecha de Vencimiento: ' + fechaVencimientoFormatted)
    doc.moveDown();
    doc.moveDown();
    doc.text('Datos Cliente', {
        underline: true
    });
    doc.moveDown();
    doc.text('Nombre: ' + nombreCompleto)
    doc.moveDown();
    doc.text('Cedula: ' + cedula)
    doc.moveDown();
    doc.text('Dirección: ' + direccion)
    doc.moveDown();
    doc.moveDown();
    doc.text('Consumo de energia', {
        underline: true
    });
    doc.moveDown();
    doc.text('Consumo de energia: ' + consumoEnergia + ' Kwh').moveDown();
    doc.text('Valor: $' + valor).moveDown();
    doc.end();
}


module.exports = {
    getPlanillas,
    createPlanilla,
    updatePlanilla,
    deletePlanilla,
    generarPdf
}