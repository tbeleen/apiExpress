// 1. importar librerias necesarias
const express = require('express')
const oracledb = require('oracledb')

// 2. crear la variable de la API
const app = express()
const port= 3000
const dbConfig = {
    user: "api_producto",
    password: "api_producto",
    connectString: "localhost/xe"
}
const API_KEY = "FERREPROD"

// 3. Middleware:
function apiKeyMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key']
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({error: "API key inválida o no proporcionada"} )
    }
    next()
}

app.use(express.json())

//4. endpoints
app.get('/Productos', apiKeyMiddleware , async (req,res) => {
    let conexion
    try {
        conexion = await oracledb.getConnection(dbConfig)
        const result = await conexion.execute("SELECT * FROM productos")
        res.json(result.rows.map(row => ({
            cod_producto: row[0],
            marca_prod: row[1],
            modelo_prod: row[2],
            nombre_prod: row[3],
            precio_prod: row[4],
            stock: row[5],
            imagen_url: row[6]
        })))
    } catch (ex) {
        res.status(500).json( {error: ex.message} )
    }finally {
        if (conexion) {
            await conexion.close()
        }
    }
})

// 5. iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en puerto ${port}`);
})

