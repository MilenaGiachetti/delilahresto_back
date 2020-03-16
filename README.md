# Delilah Resto Backend

El Backend de Delilah Resto es el tercer proyecto del curso de Desarrollo Web Full Stack (DWFS) de Acámica.  
Este proyecto se basa en el desarrollo de un backend para un restaurante ficticio utilizando NodeJS, Express y MySQL. Requiere un CRUD de usuarios, productos y ordenes, la posibilidad de que los usuarios puedan hacer un login y, relacionado a esto último, un sistema de autorización y autenticación de usuarios realizado con Json Web Tokens. 

## Instalación
### 1- Node.js
Este proyecto trabaja con Node.js, por ende, de no tenerlo instalado se lo debe instalar para el funcionamiento del proyecto. Se lo puede descargar e instalar en [https://nodejs.org/es/download/](https://nodejs.org/es/download/).

### 2- Instalación de paquetes:
Las dependencias son instaladas con el siguiente comando:
 
```bash
npm install
```
### 3- XAMPP:
El proyecto requiere tener instalado XAMPP o algún otro sistema de gestión de base de datos MySQL. Se lo puede descargar e instalar en [https://www.apachefriends.org/es/index.html](https://www.apachefriends.org/es/index.html).
En XAMPP se debe tener activado los módulos Apache y MySQL para poder realizar operaciones con la base de datos. De tener otro sistema realizar una acción equivalente.

### 4- Instalación de base de datos:
0-Para crear la estructura de la base de datos y tablas: 

```bash
node app/db/0_db_structure.js
```

1-Para agregar 2 usuarios Admins: 

```bash
node app/db/1_db_admin.js
```

2-Para agregar data inicial de usuarios, productos y pedidos (opcional): 

```bash
node app/db/2_db_seed.js
```

### 5- Inicializar el servidor
Para inicializar el servidor y poder comenzar a realizar consultas

```bash
node server.js
```

## Open API
Para ver más información referirse a la [documentación de la API](https://app.swaggerhub.com/apis/MilenaGiachetti/Delilah_Resto/1.0.0#/) o abrir archivo spec.yml
