//const axios = require('axios').default;
const path = require('path');
const sizeOf = require('image-size');

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
        JOIN cliente ON cliente.cedula = vivienda.id_cliente
        ORDER BY fecha_emision DESC;`;
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
    let data = null;

    try{
        const query = `SELECT planilla.id, registro.imagen_procesada , valor, cliente.nombres, cliente.apellidos,cliente.cedula,
        vivienda.direccion,vivienda.villa,vivienda.mz, planilla.fecha_emision, planilla.fecha_vencimiento, 
        planilla.energia_consumida, registro.lectura
        FROM planilla
        JOIN vivienda ON vivienda.codigo = planilla.codigo_vivienda
        JOIN cliente ON cliente.cedula = vivienda.id_cliente
		JOIN registro ON registro.id = planilla.id_registro
        WHERE planilla.id = $1;`;
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
    const lectura = planilla.lectura;
    console.log(lectura);

    //Use ../images/logo.png as logo
    const logo = path.join(__dirname, '../images/logo.png');

    const doc = new PDFDocument({
        bufferPages: true,
        size: [612, 1200],
    });


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

    doc.fontSize(20);
    //Logo
    doc.image(logo,{
        fit: [doc.page.width / 2 + 150 , 200],
        align: 'center',
        valign: 'center',
    }).moveDown();
    doc.text(`Cdla. Garzota, sector 3, mz 47, Dr.Luis Augusto Mendoza Moreira, Guayaquil 090513`, {
        align: 'center'
    })
    doc.text(`RUC: 2054010101001`, {
        align: 'center'
    }).moveDown();
    doc.text(`Telf: (04) 380-1900 ext. 5436`, {
        align: 'center'
    }).moveDown();
    doc.moveDown();
    doc.fontSize(28)
    doc.text(`Datos cliente`, {
        align: 'center',
        bold: true,
        underline: true
    }).moveDown();
    doc.fontSize(20);
    doc.text('Nombre: ' + nombreCompleto, {
        align: 'center'
    })
    doc.moveDown();
    doc.text('Cedula: ' + cedula, {
        align: 'center'
    })
    doc.moveDown();
    doc.text('Dirección: ' + direccion, {
        align: 'center'
    })
    doc.fontSize(28)
    doc.moveDown();
    doc.moveDown();
    doc.text('Planilla de Consumo', {
        underline: true,
        align: 'center',

    });
    doc.fontSize(20);
    doc.moveDown();
    doc.text('Fecha de Emisión: ' + fechaEmisionFormatted, {
        align: 'center'
    })
    doc.moveDown();
    doc.text('Factura N°: ' + id, {
        align: 'center'
    })
    doc.moveDown();
    doc.text('Fecha de Vencimiento: ' + fechaVencimientoFormatted, {
        align: 'center'
    })
    doc.moveDown();
    doc.moveDown();
    doc.fontSize(28)
    doc.fontSize(28)
    doc.text('Consumo de energia', {
        underline: true,
        align: 'center'
    });
    doc.fontSize(20);
    doc.moveDown();
    doc.text('Lectura: ' + lectura, {
        align: 'center'
    }).moveDown();
    doc.text('Consumo electrico: ' + consumoEnergia + ' Kwh', {
        align: 'center'
    }).moveDown();
    doc.text('Valor: $' + valor, {
        align: 'center'
    }).moveDown();
    doc.end();
}


module.exports = {
    getPlanillas,
    createPlanilla,
    updatePlanilla,
    deletePlanilla,
    generarPdf
}