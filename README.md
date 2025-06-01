# API express
# 📦 API de Productos - Express (FERREMAS)
Esta API proporciona el manejo de productos en el sistema FERREMAS: registro, carga de imágenes, listado y actualización. Fue desarrollada en Node.js con Express.js y utiliza multer para la gestión de imágenes.
________________________________________
# ✅ Requisitos Previos
* Node.js 16.x o superior
* npm (Node Package Manager)
________________________________________
# 📦 Instalación de dependencias
Ejecuta en la raíz del proyecto:
* bash
* npm install express
* npm install axios
* npm install multer

" 🚀 Cómo levantar el servidor
Desde la raíz del proyecto, ejecuta:
* bash
* node index.js
Esto levantará la API en:
http://localhost:3000
# 🔗 Comunicación con Django
El frontend Django usa axios para conectarse a esta API en http://localhost:3000/productos.
