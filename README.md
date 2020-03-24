# Delilah Resto Backend

## Tabla de contenidos
* [Información General](#información-general)
* [Instalación](#instalación)
* [Datos de usuarios](#datos-de-usuarios-admins-y-no-admins)
* [Documentación](#open-api)
  
## Información general
  

El Backend de Delilah Resto es el tercer proyecto del curso de Desarrollo Web Full Stack (DWFS) de Acámica.  

Este proyecto se basa en el desarrollo de un backend para un restaurante ficticio utilizando NodeJS, Express y MySQL. Requiere un CRUD de usuarios, productos y ordenes, la posibilidad de que los usuarios puedan hacer un login y, relacionado a esto último, un sistema de autorización y autenticación de usuarios realizado con Json Web Tokens.   
  
  
## Instalación
### 1- Node.js
Este proyecto trabaja con Node.js, por ende, de no tenerlo instalado se lo debe instalar para el funcionamiento del proyecto. Se lo puede descargar e instalar en [https://nodejs.org/es/download/](https://nodejs.org/es/download/).  

### 2- Instalación de paquetes:
Las dependencias se instalan con el siguiente comando:
 
```bash
npm install
```  
  
-Asegurarse que todos los comandos sean hechos con la carpeta raíz del proyecto como current directory  

### 3- XAMPP:
El proyecto también requiere tener instalado XAMPP o algún otro sistema de gestión de base de datos MySQL. Se lo puede descargar e instalar en [https://www.apachefriends.org/es/index.html](https://www.apachefriends.org/es/index.html).  

En XAMPP se debe tener activado los módulos Apache y MySQL para poder realizar operaciones con la base de datos. De tener otro sistema realizar una acción equivalente.  
  

### 4- Configuración datos de conexión con la base de datos:  
Entrando al archivo **db_connection_data.js** dentro de **app/config** se pueden observar las siguientes variables para la configuración de la conexión:


```json
conf_db_name  : 'delilah_resto',  // database name
conf_user     : 'root',           // user name
conf_password : '',               // password
conf_port     : '3306',           // port number
```
   
Los valores de estas variables pueden ser modificados de ser necesario.


### 5- Instalación de base de datos:  
#### 5.0-Comando para crear la estructura de la base de datos y tablas: 

```bash
node app/db/0_db_structure.js
```  
-Tener en cuenta que si ya existe un base de datos llamada 'delilah_resto' (o cómo la haya renombreado en el paso 4) será eliminada en este paso  

#### 5.1-Comando para agregar 2 usuarios Admins: 

```bash
node app/db/1_db_admin.js
```  

#### 5.2-Comando para agregar dummy data de usuarios, productos y pedidos (opcional): 

```bash
node app/db/2_db_seed.js
```  

### 6- Inicializar el servidor
Para inicializar el servidor y poder comenzar a realizar consultas:

```bash
node server.js
```  
  

## Datos de usuarios Admins y NO Admins
### Datos de Admins:
Admin 1:

```json
{
    "user_id": 1,
    "username": "HelianaMHenriquez",
    "password": "HelianaPass"
}
```

Admin 2:

```json
{
    "user_id": 2,
    "username": "CarlosArroyo",
    "password": "CarlosArroyoPass"
}
```  
  
### Datos de Usuarios NO admins (sólo existentes de haberse realizado el paso opcional 5.2):
Usuario 1:

```json
{
    "user_id": 4,
    "username": "Carmelo",
    "password": "Carmelo"
}
```

Usuario 2:

```json
{
    "user_id": 27,
    "username": "Estelle",
    "password": "Estelle"
}
```
   
   
## Open API
Para ver más información referirse a la [documentación de la API](https://app.swaggerhub.com/apis/MilenaGiachetti/Delilah_Resto/1.0.0#/) o abrir archivo **spec.yml** del repositorio
