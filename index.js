// 1. importar librerias necesarias
const express = require('express')
const { autoCommit } = require('oracledb')
const oracledb = require('oracledb')

const multer = require('multer')
const fs = require('fs')
const path = require('path')

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName)
  }
})


// 2. crear la variable de la API
const app = express()
const port= 3000

const dbConfig = {
    user: "api_sitioferremas",
    password: "api_sitioferremas",
    connectString: "localhost/xe"
}
const API_KEY = "FERREPROD"

function apiKeyMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key']
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({error: "API key inválida o no proporcionada"} )
    }
    next()
}

// 3. Middleware:
app.use(express.json())

//4. endpoints
//categorias:
app.get('/categorias', async (req,res) => {
    let conexion
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute("SELECT * FROM categorias")
        res.json(result.rows.map(row => ({
            id_categoria: row[0],
            nombre_categoria: row[1]
        })))
    } catch (ex) {
        res.status(500).json( {error: ex.message} )
    }finally {
        if (conexion) await conexion.close()  
    }
})

app.get('/categorias/:id_categoria', async (req, res) => {
    let conexion
    const id_categoria = req.params.id_categoria
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute('SELECT * FROM categorias WHERE id_categoria = :id_categoria', [id_categoria])
        if(result.rows.length===0){
            res.status(404).json({mensaje: "categoria no encontrada"})
        }else{
            const row = result.rows[0]
            res.json({
            id_categoria: row[0],
            nombre_categoria: row[1]
            })
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally {
        if (conexion) await conexion.close()
    }
})

app.post('/categorias', async (req, res) => {
    let conexion
    const {id_categoria, nombre_categoria} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        await conexion.execute(`INSERT INTO categorias 
            VALUES(:id_categoria, :nombre_categoria)`
            ,{id_categoria, nombre_categoria}
            ,{autoCommit: true}
        )
        res.status(201).json({mensaje: "categoria creada"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
       if(conexion) conexion.close() 
    }
})

app.put('/categorias/:id_categoria', async (req,res) => {
    let conexion
    const id_categoria = req.params.id_categoria
    const {nombre_categoria} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(
            `UPDATE categorias 
            SET :nombre_categoria
            WHERE id_categoria = :id_categoria`
            ,{id_categoria,nombre_categoria}
            ,{autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje: "categoria no encontrada"})
        }else{
            res.json({mensaje: "categoria actualizado"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) conexion.close()
    }
})

app.delete('/categorias/:id_categoria', async (req,res) => {
    let conexion
    const id_categoria = req.params.id_categoria
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(
            `DELETE FROM categorias
            WHERE id_categoria = :id_categoria`
            ,[id_categoria]
            ,{autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje:"Categoria no encontrada"})
        }else {
            res.json({mensaje: "Categoria eliminada"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) await conexion.close()
    }
})
//SUBCATEGORIAS:
app.get('/subcategorias', async (req,res) => {
    let conexion
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute("SELECT * FROM subcategorias")
        res.json(result.rows.map(row => ({
            id_subcategoria: row[0],
            nombre_subcat: row[1],
            id_categoria: row[3]
        })))
    } catch (ex) {
        res.status(500).json( {error: ex.message} )
    }finally {
        if (conexion) await conexion.close()  
    }
})

app.get('/subcategorias/:id_subcategoria', async (req, res) => {
    let conexion
    const id_subcategoria = req.params.id_subcategoria
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute('SELECT * FROM subcategorias WHERE id_subcategoria = :id_subcategoria', [id_subcategoria])
        if(result.rows.length===0){
            res.status(404).json({mensaje: "subcategoria no encontrada"})
        }else{
            const row = result.rows[0]
            res.json({
            id_subcategoria: row[0],
            nombre_subcat: row[1]
            })
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally {
        if (conexion) await conexion.close()
    }
})

app.post('/subcategorias', async (req, res) => {
    let conexion
    const {id_subcategoria,nombre_subcat,id_categoria} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        await conexion.execute(`INSERT INTO subcategorias 
            VALUES(:id_subcategoria, :nombre_subcat,:id_categoria)`
            ,{id_subcategoria,nombre_subcat,id_categoria}
            ,{autoCommit: true}
        )
        res.status(201).json({mensaje: "subcategoria creada"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
       if(conexion) conexion.close() 
    }
})

app.put('/subcategorias/:id_subcategoria', async (req,res) => {
    let conexion
    const id_subcategoria = req.params.id_subcategoria
    const {nombre_categoria,id_categoria} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(
            `UPDATE subcategorias 
            SET :nombre_categoria,id_categoria
            WHERE id_subcategoria = :id_subcategoria`
            ,{id_subcategoria,nombre_categoria,id_categoria}
            ,{autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje: "subcategoria no encontrada"})
        }else{
            res.json({mensaje: "subcategoria actualizado"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) conexion.close()
    }
})

app.delete('/subcategorias/:id_subcategoria', async (req,res) => {
    let conexion
    const id_subcategoria = req.params.id_subcategoria
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(
            `DELETE FROM subcategorias
            WHERE id_subcategoria = :id_subcategoria`
            ,[id_subcategoria]
            ,{autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje:"Subategoria no encontrada"})
        }else {
            res.json({mensaje: "Subategoria eliminada"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) await conexion.close()
    }
})

app.get('/productos', async (req,res) => {
    let conexion
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(`SELECT p.id_producto,p.cod_producto,p.modelo_prod,m.nombre,p.nombre_prod,p.descripcion,TO_CHAR(p.precio_prod, 'FM9G999G999') AS precio_prod,p.stock,p.imagen_url,s.nombre_subcat,p.id_subcategoria FROM productos p 
            JOIN marca m ON p.id_marca = m.id_marca
            JOIN subcategorias s ON p.id_subcategoria = s.id_subcategoria
 `)
        res.json(result.rows.map(row => ({
            id_producto: row[0],
            cod_producto: row[1],
            modelo_prod: row[2],
            nombre: row[3],
            nombre_prod: row[4],
            descripcion: row[5],
            precio_prod: row[6],
            stock: row[7],
            imagen_url: row[8],
            nombre_subcat: row[9],   
            id_subcategoria: row[10]
        })))
    } catch (ex) {
        res.status(500).json( {error: ex.message} )
    }finally {
        if (conexion) await conexion.close()  
    }
})

app.get('/productos/:id_producto', async (req, res) => {
    let conexion
    const id_producto = req.params.id_producto
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute('SELECT * FROM productos WHERE id_producto = :id_producto', [id_producto])
        if(result.rows.length===0){
            res.status(404).json({mensaje: "Producto no encontrado"})
        }else{
            const row = result.rows[0]
            res.json({
            id_producto: row[0],
            cod_producto: row[1],
            modelo_prod: row[2],
            id_marca: row[3],
            nombre_prod: row[4],
            descripcion: row[5],
            precio_prod: row[6],
            stock: row[7],
            imagen_url: row[8],
            id_subcategoria: row[9],   
            })
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally {
        if (conexion) await conexion.close()
    }
})

app.post('/productos', async (req, res) => {
    let conexion
    const {id_producto, cod_producto, modelo_prod,id_marca, nombre_prod, precio_prod, stock, imagen_url, id_subcategoria,descripcion} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        await conexion.execute(`INSERT INTO productos 
            VALUES(:id_producto,:cod_producto, :modelo_prod, :id_marca, :nombre_prod, :precio_prod, :stock, :imagen_url, :id_subcategoria,:descripcion)`
            ,{id_producto,cod_producto,marca_prod,modelo_prod,id_marca,nombre_prod,precio_prod,stock,imagen_url,id_subcategoria,descripcion}
            ,{autoCommit: true}
        )
        res.status(201).json({mensaje: "Producto creado"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
       if(conexion) conexion.close() 
    }
})

app.put('/productos/:id_producto', async (req,res) => {
    let conexion
    const id_producto = req.params.id_producto
    const {cod_producto, modelo_prod, id_marca, nombre_prod, precio_prod, stock, imagen_url, id_subcategoria,descripcion} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(
            `UPDATE productos 
            SET cod_producto = :cod_producto, modelo_prod = :modelo_prod, id_marca = :id_marca, nombre_prod = :nombre_prod, precio_prod = :precio_prod, stock = :stock, imagen_url = :imagen_url, id_subcategoria = :id_subcategoria, descripcion = :descripcion
            WHERE id_producto = :id_producto`
            ,{id_producto,cod_producto,modelo_prod,id_marca,nombre_prod,precio_prod,stock,imagen_url,id_subcategoria,descripcion}
            ,{autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje: "Producto no encontrado"})
        }else{
            res.json({mensaje: "Producto actualizado"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) conexion.close()
    }
})

app.delete('/productos/:id_producto', async (req,res) => {
    let conexion
    const id_producto = req.params.id_producto
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(
            `DELETE FROM productos
            WHERE id_producto = :id_producto`
            ,[id_producto]
            ,{autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje:"Producto no encontrado"})
        }else {
            res.json({mensaje: "Producto eliminado"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) await conexion.close()
    }
})

app.patch('/productos/:id_producto', async (req,res) => {
    let conexion
    const id_producto = req.params.id_producto
    const {cod_producto, modelo_prod, id_marca, nombre_prod, precio_prod, stock, imagen_url, id_subcategoria,descripcion} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        let campos = []
        let valores = {}
        if(cod_producto !== undefined){
            campos.push('cod_producto = :cod_producto')
            valores.cod_producto = cod_producto
        }
        if(modelo_prod !== undefined){
            campos.push('modelo_prod = :modelo_prod')
            valores.modelo_prod = modelo_prod
        }
        if(id_marca !== undefined){
            campos.push('id_marca = :id_marca')
            valores.id_marca = id_marca
        }
        if(nombre_prod !== undefined){
            campos.push('nombre_prod = :nombre_prod')
            valores.nombre_prod = nombre_prod
        }
        if(precio_prod !== undefined){
            campos.push('precio_prod = :precio_prod')
            valores.precio_prod = precio_prod
        }
        if(stock !== undefined){
            campos.push('stock = :stock')
            valores.stock = stock
        }
        if(imagen_url !== undefined){
            campos.push('imagen_url = :imagen_url')
            valores.imagen_url = imagen_url
        }
        if(id_subcategoria !== undefined){
            campos.push('id_subcategoria = :id_subcategoria')
            valores.id_subcategoria = id_subcategoria
        }
        if(descripcion !== undefined){
            campos.push('descripcion = :descripcion')
            valores.descripcion = descripcion
        }
        if(campos.length===0){
            res.status(400).json({mensaje: "No se enviaron campos para actualizar"})
        }
        valores.id_producto = id_producto
        const sql = `UPDATE productos SET ${campos.join(', ')} WHERE id_producto = :id_producto`
        const result = await conexion.execute(
            sql, valores, {autoCommit: true}
        )
        if(result.rowsAffected===0){
            res.status(404).json({mensaje: "El Producto no existe"})
        }else {
            res.json({mensaje: "Producto actualizado parcialmente"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if(conexion) await conexion.close()
    }
})

//Post para PEDIDO:  Para registrar toda la compra (pedido + detalle).
app.post('/pedido', async (req, res) => {
  let conexion;
  const { total, rut, id_tipo_entrega, id_sucursal, id_cupon, productos,id_tipo_pago,pago_confirmado } = req.body;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    // Insertar pedido
    const result = await conexion.execute(
      `INSERT INTO pedido (total, rut, id_tipo_entrega, id_sucursal, id_cupon)
       VALUES (:total, :rut, :id_tipo_entrega, :id_sucursal, :id_cupon)
       RETURNING id_pedido INTO :id_pedido`,
      {
        total,
        rut,
        id_tipo_entrega,
        id_sucursal,
        id_cupon,
        id_pedido: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const id_pedido = result.outBinds.id_pedido[0];

    // Por cada producto comprado
    for (const prod of productos) {
      // 1. Insertar en detalle_pedido
      await conexion.execute(
        `INSERT INTO detalle_pedido (id_pedido, id_producto,id_estado_pedido, cantidad, precio_unitario, subtotal)
         VALUES (:id_pedido, :id_producto,:id_estado_pedido, :cantidad, :precio_unitario, :subtotal)`,
        {
          id_pedido,
          id_producto: prod.id_producto,
          id_estado_pedido: prod.id_estado_pedido,
          cantidad: prod.cantidad,
          precio_unitario: prod.precio_unitario,
          subtotal: prod.subtotal
        }
      )

      // 2. Actualizar stock del producto
      await conexion.execute(
        `UPDATE productos SET stock = stock - :cantidad
         WHERE id_producto = :id_producto AND stock >= :cantidad`,
        {
          cantidad: prod.cantidad,
          id_producto: prod.id_producto
        }
      );
    }
    const result_pago = await conexion.execute(
      `INSERT INTO pago (id_pedido, rut_usuario, id_tipo_pago, monto, pago_confirmado)
        VALUES (:id_pedido, :rut_usuario, :id_tipo_pago, :monto, :pago_confirmado)
        RETURNING id_pago INTO :id_pago`,
      {
        id_pedido,
        rut_usuario: rut,
        id_tipo_pago,
        monto: total,
        pago_confirmado,
        id_pago: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    )
// 3. Actualizar estado_pedido
  await conexion.commit();

  res.status(201).json({ mensaje: 'Pedido registrado y stock actualizado', id_pedido, id_pago: result_pago.outBinds.id_pago[0] });

  } catch (error) {
    if (conexion) await conexion.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});

//get para cuando el cliente entre a sus compras:
app.get('/pedidos/:rut', async (req, res) => {
  let conexion;
  const { rut } = req.params;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT 
         p.id_pedido, 
         p.fecha, 
         p.total,
         p.rut, 
         dp.cantidad, 
         dp.precio_unitario, 
         dp.precio_unitario * dp.cantidad AS subtotal,
         prod.nombre_prod AS nombre_producto,
         ep.estado AS estado_pedido,
         pa.pago_confirmado,
         pa.id_tipo_pago,
         tp.descripcion AS tipo_pago
       FROM pedido p
       JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
       JOIN productos prod ON prod.id_producto = dp.id_producto
       LEFT JOIN estado_pedido ep ON ep.id_estado_pedido = dp.id_estado_pedido
       LEFT JOIN pago pa ON pa.id_pedido = p.id_pedido
       LEFT JOIN tipo_pago tp ON tp.id_tipo_pago = pa.id_tipo_pago
       WHERE p.rut = :rut
       ORDER BY p.fecha DESC`,
      { rut },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });

  } finally {
    if (conexion) await conexion.close();
  }
});

app.get('/pedidos_bodega', async (req, res) => {
  let conexion;

  // corregimos esto
  const estado_prep = req.query.estado || 1;
  const pago_confirmado = req.query.pago_confirmado || 'S';

  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT 
         p.id_pedido, 
         p.fecha, 
         p.total,
         p.rut, 
         dp.cantidad, 
         dp.precio_unitario, 
         (dp.precio_unitario * dp.cantidad) AS subtotal,
         prod.nombre_prod AS nombre_producto,
         ep.estado AS estado_pedido,
         pa.pago_confirmado,
         pa.id_tipo_pago,
         tp.descripcion AS tipo_pago,
         p.id_tipo_entrega
       FROM pedido p
       JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
       JOIN productos prod ON prod.id_producto = dp.id_producto
       LEFT JOIN estado_pedido ep ON ep.id_estado_pedido = dp.id_estado_pedido
       LEFT JOIN pago pa ON pa.id_pedido = p.id_pedido
       LEFT JOIN tipo_pago tp ON tp.id_tipo_pago = pa.id_tipo_pago
       WHERE dp.id_estado_pedido = :estado_prep AND pa.pago_confirmado = :pago_confirmado
       ORDER BY p.fecha DESC`,
      {
        estado_prep,
        pago_confirmado
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows.map(row => ({
      id_pedido: row.ID_PEDIDO,
      fecha: row.FECHA,
      total: row.TOTAL,
      rut: row.RUT,
      cantidad: row.CANTIDAD,
      precio_unitario: row.PRECIO_UNITARIO,
      subtotal: row.SUBTOTAL,
      nombre_producto: row.NOMBRE_PRODUCTO,
      estado_pedido: row.ESTADO_PEDIDO,
      pago_confirmado: row.PAGO_CONFIRMADO,
      id_tipo_pago: row.ID_TIPO_PAGO,
      tipo_pago: row.TIPO_PAGO,
      id_tipo_entrega: row.ID_TIPO_ENTREGA
    })));

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});



app.put('/pedido_bodega/:id', async (req, res) => {
  let conexion;
  const { id } = req.params;
  const { nuevo_estado } = req.body; // por ejemplo: 4 = Listo para entregar

  try {
    conexion = await oracledb.getConnection(dbConfig);

    await conexion.execute(
      `UPDATE detalle_pedido SET id_estado_pedido = :nuevo_estado WHERE id_pedido = :id`,
      { nuevo_estado, id },
      { autoCommit: true }
    );

    res.json({ message: 'Estado actualizado correctamente' });

  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ error: error.message });

  } finally {
    if (conexion) await conexion.close();
  }
})



app.post('/detalle_pedido', async (req, res) => {
  let conexion;
  const { id_pedido, id_producto, id_estado_pedido, cantidad, precio_unitario } = req.body;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    const subtotal = cantidad * precio;

    await conexion.execute(
      `INSERT INTO detalle_pedido (id_pedido, id_producto, id_estado_pedido, cantidad, precio_unitario)
       VALUES (:id_pedido, :id_producto, :id_estado_pedido, :cantidad, :precio_unitario)`,
      { id_pedido, id_producto,id_estado_pedido,cantidad, precio_unitario, subtotal },
      { autoCommit: true }
    );

    res.status(201).json({ mensaje: 'Detalle registrado con éxito' });
  } catch (error) {
    if (conexion) await conexion.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});


//GET detalle pedido(id_pedido):Para mostrar el detalle de cada pedido (productos, cantidades, etc).
app.get('/detalle_pedido/:id_pedido', async (req, res) => {
  let conexion;
  const id_pedido = req.params.id_pedido;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT  
          dp.id_pedido, 
          prod.nombre_prod,
          ep.estado AS estado_pedido,
          estp.descripcion AS estado_pago,
          dp.cantidad, 
          dp.precio_unitario, 
          dp.subtotal,
          dp.descuento
        FROM detalle_pedido dp
        JOIN pedido p ON dp.id_pedido = p.id_pedido
        JOIN productos prod ON dp.id_producto = prod.id_producto
        LEFT JOIN estado_pedido ep ON dp.id_estado_pedido = ep.id_estado_pedido
        LEFT JOIN estado_pago estp ON dp.id_estado_pago = estp.id_estado_pago
        WHERE dp.id_pedido = :id_pedido
        ORDER BY p.fecha DESC`,
      { id_pedido },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      res.status(404).json({ mensaje: "Detalle del pedido no encontrado" });
    } else {
      const detalles = result.rows.map(row => ({
        id_pedido: row.ID_PEDIDO,
        nombre_prod: row.NOMBRE_PROD,
        estado_pedido: row.ESTADO_PEDIDO,
        estado_pago: row.ESTADO_PAGO,
        cantidad: row.CANTIDAD,
        precio_unitario: row.PRECIO_UNITARIO,
        subtotal: row.SUBTOTAL,
        descuento: row.DESCUENTO
      }));
      res.json(detalles);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});

app.get('/mis_pedidos/:rut', async (req, res) => {
  let conexion;
  const rut = req.params.rut;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT 
          p.id_pedido,
          TO_CHAR(p.fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha,
          p.total,
          dp.cantidad,
          dp.precio_unitario,
          prod.nombre_prod AS nombre_producto,
          ep.estado AS estado_pedido
        FROM pedido p
        JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
        JOIN productos prod ON dp.id_producto = prod.id_producto
        LEFT JOIN estado_pedido ep ON dp.id_estado_pedido = ep.id_estado_pedido
        WHERE p.rut = :rut
        ORDER BY p.fecha DESC`,
      { rut },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});


app.get('/tipo_entrega', async (req,res) => {
    let conexion
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute("SELECT * FROM tipo_entrega")
        res.json(result.rows.map(row => ({
            id_tipo_entrega: row[0],
            tipo_entrega: row[1],       
        })))
    } catch (ex) {
        res.status(500).json( {error: ex.message} )
    }finally {
        if (conexion) await conexion.close()  
    }
})

//Get tipo_entrega
app.get('/tipo_entrega/:id_Pedido', async (req, res) => {
    let conexion
    const id_Pedido = req.params.id_Pedido;

  try {
    conexion = await oracledb.getConnection(dbConfig); 
    const result = await conexion.execute('SELECT * FROM tipo_entrega WHERE id_pedido = :id_Pedido',[id_Pedido], {outFormat: oracledb.OUT_FORMAT_OBJECT})
    if(result.rows.length===0){
        res.status(404).json({mensaje: "No se encontró la entrega asociada a ese pedido"})
    }else{
        res.json(result.rows[0])
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }finally{
    if(conexion) await conexion.close();
  }
});

//SUCURSAL: Get: ver todas las sucursales disponibles
app.get('/sucursales', async (req, res) => {
    let conexion
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute('SELECT * FROM sucursal')
        res.json(result.rows.map(row => ({
            id_sucursal: row[0],
            nombre: row[1],
            direccion: row[2],
            id_comuna: row[3],
        })))
    } catch (error) {
        res.status(500).json({error:message})
    }finally{
        if(conexion) await conexion.close();
    }
})

//POST sucursal: para crear sucursales.
app.post('/sucursales', async (req,res) => {
    let conexion
    const {id_sucursal,nombre,direccion,id_comuna} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        await conexion.execute('INSERT INTO sucursal VALUES(:id_sucursal,:nombre,:direccion,:id_comuna)',
            {id_sucursal,nombre,direccion,id_comuna}, {autoCommit:true}
        )
        res.status(201).json({mensaje: "Sucursal creada"})
    } catch (error) {
        res.status(500).json({error:message})
    }finally{
        if(conexion) await conexion.close()
    }
})
//PUT sucursal: Editar sucursales:
app.put('/sucursales/:id_sucursal', async (req,res) => {
    let conexion
    const id_sucursal = req.params.id_sucursal
    const {nombre, direccion,id_comuna} = req.body
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(`UPDATE sucursal
            SET nombre = :nombre, direccion = :direccion, :id_comuna = :id_comuna WHERE id_sucursal = :id_sucursal`,
        {id_sucursal,nombre,direccion,id_comuna}, {autoCommit:true})
        if(result.rowsAffected===0){
            res.status(404).json({mensaje: "Sucursal no encontrada"})
        }else{
            res.json({mensaje: "Sucursal modificada"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if (conexion) await conexion.close()
    }
})
// DELETE sucursal:
app.delete('/sucursales/id_sucursal', async (req,res) => {
    let conexion
    const id_sucursal = req.params.id_sucursal
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute(`
            DELETE FROM sucursal WHERE id_sucursal = :id_sucursal`, [id_sucursal], {autoCommit: true}
        )
        if(result.rowsAffected === 0) {
            res.status(404).json({mensaje: "Sucursal no encontrada"})
        }else{
            res.json({mensaje: "Sucursal eliminada"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{
        if (conexion) await conexion.close()
    }
})

app.get('/productos/marca/:id', async (req, res) => {
  const idMarca = req.params.id;
  let conexion;
  try {
    conexion = await oracledb.getConnection(dbConfig);
    const result = await conexion.execute(
      'SELECT id_producto, nombre_prod, precio_prod, imagen_url, id_marca FROM productos WHERE id_marca = :id',
      [idMarca]
    );
    res.json(result.rows.map(row => ({
      id_producto: row[0],
      nombre_prod: row[1],
      precio_prod: row[2],
      imagen_url: row[3],
      id_marca: row[4]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});


//get marcas:
app.get('/marca', async (req, res) => {
  let conexion
  try {
    conexion = await oracledb.getConnection(dbConfig)
    const result = await conexion.execute('SELECT id_marca, nombre, img_marca FROM marca')
    res.json(result.rows.map(row => ({
        id_marca: row[0],
        nombre: row[1],
        img_marca: row[2]
    })))
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (conexion) await conexion.close()
  }
})

//post marca
app.post('/marca', async (req, res) => {
  let conexion
  const { id_marca, nombre, img_marca } = req.body
  try {
    conexion = await oracledb.getConnection(dbConfig)
    await conexion.execute(
      `INSERT INTO marca VALUES (:id_marca, :nombre, :img_marca)`,
      { id_marca, nombre, img_marca },
      { autoCommit: true }
    );
    res.status(201).json({ mensaje: 'Marca registrada correctamente' })
  } catch (error) {
    if (error.errorNum === 1) {
      res.status(400).json({ error: 'El nombre de la marca ya existe o ID duplicado' })
    } else {
      res.status(500).json({ error: error.message })
    }
  } finally {
    if (conexion) await conexion.close()
  }
})

//delete marca
app.delete('/marca/:id_marca', async (req, res) => {
  let conexion
  const id_marca = req.params.id_marca
  try {
    conexion = await oracledb.getConnection(dbConfig)
    const result = await conexion.execute(
      `DELETE FROM marca WHERE id_marca = :id_marca`,
      [id_marca],
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ mensaje: 'Marca no encontrada' })
    } else {
      res.json({ mensaje: 'Marca eliminada correctamente' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (conexion) await conexion.close()
  }
})

//get cupón:
app.get('/cupones/:codigo', async (req, res) => {
  let conexion
  const codigo = req.params.codigo
  try {
    conexion = await oracledb.getConnection(dbConfig)
    const result = await conexion.execute(
      `SELECT * FROM cupon WHERE codigo = :codigo`,
      [codigo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cupón no encontrado' })
    }
    const cupon = result.rows[0]
    const hoy = new Date()
    const fechaExp = new Date(cupon.FECHA_EXPIRACION)
    if (cupon.USADO === 'S') {
      return res.status(400).json({ mensaje: 'El cupón ya ha sido usado' })
    }
    if (fechaExp < hoy) {
      return res.status(400).json({ mensaje: 'El cupón ha expirado' })
    }
    await conexion.execute(
      `UPDATE cupon SET usado = 'S' WHERE id_cupon = :id`,
      [cupon.ID_CUPON],
      { autoCommit: true }
    )
    res.json({
      mensaje: 'Cupón aplicado correctamente',
      id_cupon: cupon.ID_CUPON,
      codigo: cupon.CODIGO,
      descuento: cupon.DESCUENTO,
      monto_minimo: cupon.MONTO_MINIMO,
      expiracion: cupon.FECHA_EXPIRACION
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (conexion) await conexion.close()
  }
})

//post cupón:
app.post('/cupon', async (req, res) => {
  let conexion
  const { id_cupon, codigo, monto_minimo, descuento, fecha_expiracion, usado } = req.body
  try {
    conexion = await oracledb.getConnection(dbConfig)
    await conexion.execute(
      `INSERT INTO cupon
       VALUES (:id_cupon, :codigo, :monto_minimo, :descuento, :fecha_expiracion, :usado)`,
      { id_cupon, codigo, monto_minimo, descuento, fecha_expiracion, usado: usado || 'N' },
      { autoCommit: true }
    );
    res.status(201).json({ mensaje: 'Cupón creado correctamente' })
  } catch (error) {
    if (error.errorNum === 1) {
      res.status(400).json({ error: 'ID o código de cupón duplicado' })
    } else {
      res.status(500).json({ error: error.message })
    }
  } finally {
    if (conexion) await conexion.close()
  }
})

// put cupón:
app.put('/cupon/:id_cupon', async (req, res) => {
  let conexion
  const id_cupon = req.params.id_cupon
  const { codigo, monto_minimo, descuento, fecha_expiracion, usado } = req.body
  try {
    conexion = await oracledb.getConnection(dbConfig)
    const result = await conexion.execute(
      `UPDATE cupon
       SET codigo = :codigo,monto_minimo = :monto_minimo,descuento = :descuento,fecha_expiracion = :fecha_expiracion,usado = :usado
       WHERE id_cupon = :id_cupon`,
      { id_cupon, codigo, monto_minimo, descuento, fecha_expiracion, usado },
      { autoCommit: true }
    )
    if (result.rowsAffected === 0) {
      res.status(404).json({ mensaje: 'Cupón no encontrado' })
    } else {
      res.json({ mensaje: 'Cupón actualizado correctamente' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (conexion) await conexion.close()
  }
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//POST PAGO_TRANSFERENCIA
const upload = multer({ storage });

// Endpoint para recibir transferencia con comprobante
app.post('/transferencia', upload.single('archivo_comprobante'), async (req, res) => {
  let conexion;

  try {
    const { rut, total, id_pago } = req.body;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ error: 'Archivo no recibido' })
    }

    const nombreArchivo = archivo.filename;

    conexion = await oracledb.getConnection(dbConfig)

    console.log('Insertando transferencia:', { rut, total, id_pago, nombreArchivo });

    await conexion.execute(
      `INSERT INTO pago_transferencia (rut, total, archivo_comprobante, id_pago)
       VALUES (:rut, :total, :archivo_comprobante, :id_pago)`,
      {
        rut,
        total: Number(total),
        archivo_comprobante: nombreArchivo,
        id_pago: Number(id_pago)
      },
      { autoCommit: true }
    )

    res.status(201).json({ mensaje: 'Transferencia enviada con éxito' })
  } catch (error) {
    if (conexion) await conexion.rollback()
    console.error('Error en la API:', error)
    res.status(500).json({ error: error.message })
  } finally {
    if (conexion) await conexion.close()
  }
})

app.get('/transferencia', async (req, res) => {
  let conexion;
  const estado = req.query.estado || 'N';  // por defecto, solo 'pendientes'

  try {
    conexion = await oracledb.getConnection(dbConfig);
    
    const result = await conexion.execute(
      `SELECT pt.ID, pt.RUT, pt.TOTAL, pt.FECHA, pt.ARCHIVO_COMPROBANTE, pt.ID_PAGO, p.PAGO_CONFIRMADO
       FROM PAGO_TRANSFERENCIA pt
       JOIN PAGO p ON pt.ID_PAGO = p.ID_PAGO
       WHERE p.PAGO_CONFIRMADO = :estado`,
      [estado],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows.map(row => ({
      ID: row.ID,
      rut: row.RUT,
      total: row.TOTAL,
      fecha: row.FECHA,
      archivo_comprobante: row.ARCHIVO_COMPROBANTE,
      id_pago: row.ID_PAGO,
      pago_confirmado: row.PAGO_CONFIRMADO
    })));

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});

app.get('/transferencia/:id', async (req, res) => {
  let conexion;
  const id = req.params.id;
  try {
    conexion = await oracledb.getConnection(dbConfig)
    const result = await conexion.execute(
      `SELECT * FROM PAGO_TRANSFERENCIA WHERE id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      res.status(404).json({ mensaje: 'No hay historial para este pedido' })
    } else {
      res.json(result.rows)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (conexion) await conexion.close()
  }
})

app.put('/transferencia/:id/confirmar', async (req, res) => {
  let conexion;
  const idTransferencia = req.params.id;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    // Paso 1: Obtener ID_PAGO desde la transferencia
    const resultPago = await conexion.execute(
      `SELECT ID_PAGO FROM PAGO_TRANSFERENCIA WHERE ID = :id`,
      [idTransferencia],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!resultPago.rows.length || !resultPago.rows[0].ID_PAGO) {
      return res.status(404).json({ error: 'No se encontró el pago asociado a la transferencia' });
    }

    const idPago = resultPago.rows[0].ID_PAGO;

    // Paso 2: Actualizar el campo PAGO_CONFIRMADO a 'S'
    await conexion.execute(
      `UPDATE PAGO SET PAGO_CONFIRMADO = 'S' WHERE ID_PAGO = :id`,
      [idPago]
    );

    const resultPedido = await conexion.execute(
      `SELECT ID_PEDIDO FROM PAGO WHERE ID_PAGO = :id`,
      [idPago],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conexion.commit();

    return res.status(200).json({
      mensaje: 'Transferencia confirmada'
    });

  } catch (error) {
    if (conexion) await conexion.rollback();
    console.error('❌ Error al confirmar transferencia:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});


app.put('/transferencia/:id/rechazar', async (req, res) => {
  let conexion;
  const idTransferencia = req.params.id;

  try {
    conexion = await oracledb.getConnection(dbConfig);

    console.log(`🔍 Buscando ID_PAGO de transferencia ID=${idTransferencia}`);
    const resultPago = await conexion.execute(
      `SELECT ID_PAGO FROM PAGO_TRANSFERENCIA WHERE ID = :id`,
      [idTransferencia],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!resultPago.rows.length || !resultPago.rows[0].ID_PAGO) {
      return res.status(404).json({ error: 'Transferencia no encontrada' });
    }

    const idPago = resultPago.rows[0].ID_PAGO;
    console.log(`✅ ID_PAGO encontrado: ${idPago}`);

    console.log(`⛔ Actualizando PAGO_CONFIRMADO = 'R' para ID_PAGO=${idPago}`);
    await conexion.execute(
      `UPDATE PAGO SET PAGO_CONFIRMADO = 'R' WHERE ID_PAGO = :id`,
      [idPago]
    );

    const resultPedido = await conexion.execute(
      `SELECT ID_PEDIDO FROM PAGO WHERE ID_PAGO = :id`,
      [idPago],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const idPedido = resultPedido.rows[0]?.ID_PEDIDO;

    if (idPedido) {
      console.log(`📦 Cambiando estado del pedido ID=${idPedido} a ID_ESTADO_PEDIDO=5`);
      await conexion.execute(
        `UPDATE DETALLE_PEDIDO SET ID_ESTADO_PEDIDO = 5 WHERE ID_PEDIDO = :id`,
        [idPedido]
      );
    }

    await conexion.commit();
    return res.status(200).json({ mensaje: 'Transferencia rechazada y estado de pedido actualizado' });

  } catch (error) {
    if (conexion) await conexion.rollback();
    console.error('❌ Error al rechazar la transferencia:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});

app.post('/pago', async (req, res) => {
  const { id_pedido, rut_usuario, id_tipo_pago, monto, pago_confirmado } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `INSERT INTO pago (id_pedido, rut_usuario, id_tipo_pago, monto, pago_confirmado)
       VALUES (:id_pedido, :rut_usuario, :id_tipo_pago, :monto, :pago_confirmado)`,
      { id_pedido, rut_usuario, id_tipo_pago, monto, pago_confirmado },
      { autoCommit: true }
    );

    res.status(201).json({ mensaje: 'Pago registrado con éxito' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) await conn.close();
  }
})

app.get('/filtrar_productos/:id_categoria', async (req, res) => {
  let conexion;
  const id_categoria = parseInt(req.params.id_categoria);

  if (isNaN(id_categoria)) {
    return res.status(400).json({ error: "ID de categoría inválido" });
  }

  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT p.*, sc.nombre_subcat, c.nombre_categoria 
       FROM PRODUCTOS p 
       JOIN SUBCATEGORIAS sc ON p.id_subcategoria = sc.id_subcategoria 
       JOIN CATEGORIAS c ON sc.id_categoria = c.id_categoria 
       WHERE c.id_categoria = :id_categoria`,
      [id_categoria],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron productos en esta categoría" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  } finally {
    if (conexion) {
      await conexion.close();
    }
  }
});

app.get('/informes/pagos_realizados', async (req, res) => {
  let conexion;
  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT 
         p.id_pedido,
         p.fecha,
         p.total,
         p.rut,
         pa.pago_confirmado,
         pa.id_tipo_pago,
         tp.descripcion AS tipo_pago,
         dp.cantidad,
         dp.precio_unitario,
         (dp.precio_unitario * dp.cantidad) AS subtotal,
         prod.nombre_prod AS nombre_producto
       FROM pedido p
       JOIN pago pa ON pa.id_pedido = p.id_pedido
       JOIN tipo_pago tp ON tp.id_tipo_pago = pa.id_tipo_pago
       JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
       JOIN productos prod ON prod.id_producto = dp.id_producto
       WHERE pa.pago_confirmado = 'S'
       ORDER BY p.fecha DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows.map(row => ({
      id_pedido: row.ID_PEDIDO,
      fecha: row.FECHA,
      rut: row.RUT,
      total: row.TOTAL,
      tipo_pago: row.TIPO_PAGO,
      pago_confirmado: row.PAGO_CONFIRMADO,
      nombre_producto: row.NOMBRE_PRODUCTO,
      cantidad: row.CANTIDAD,
      precio_unitario: row.PRECIO_UNITARIO,
      subtotal: row.SUBTOTAL
    })));

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});

app.get('/informes/pedidos_recibidos', async (req, res) => {
  let conexion;
  try {
    conexion = await oracledb.getConnection(dbConfig);

    const result = await conexion.execute(
      `SELECT 
         p.id_pedido,
         p.fecha,
         p.total,
         p.rut,
         dp.cantidad,
         dp.precio_unitario,
         (dp.precio_unitario * dp.cantidad) AS subtotal,
         prod.nombre_prod AS nombre_producto,
         ep.estado AS estado_pedido,
         pa.pago_confirmado,
         tp.descripcion AS tipo_pago
       FROM pedido p
       JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
       JOIN productos prod ON prod.id_producto = dp.id_producto
       LEFT JOIN estado_pedido ep ON ep.id_estado_pedido = dp.id_estado_pedido
       LEFT JOIN pago pa ON pa.id_pedido = p.id_pedido
       LEFT JOIN tipo_pago tp ON tp.id_tipo_pago = pa.id_tipo_pago
       ORDER BY p.fecha DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows.map(row => ({
      id_pedido: row.ID_PEDIDO,
      fecha: row.FECHA,
      rut: row.RUT,
      total: row.TOTAL,
      nombre_producto: row.NOMBRE_PRODUCTO,
      cantidad: row.CANTIDAD,
      precio_unitario: row.PRECIO_UNITARIO,
      subtotal: row.SUBTOTAL,
      estado_pedido: row.ESTADO_PEDIDO,
      pago_confirmado: row.PAGO_CONFIRMADO,
      tipo_pago: row.TIPO_PAGO
    })));

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
});


// 5. iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en puerto ${port}`);
})

