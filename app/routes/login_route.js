module.exports = app => {
    /*-----------------REQUIREMENTS-----------------*/
    const login = require("../controllers/login_controllers");
    const router  = require("express").Router();
    
    /*---------------------------------------------USER LOG IN---------------------------------------------*/
    router.post('/login', login.login)
    
    /*-----------------ROUTES EXAMPLE USING THE EXISTENT MIDDLEWARES(eliminate)-----------------*/
    //const middlewares = require("../middlewares/middlewares");
    /*router.get('/secure', middlewares.authenticateUser, (req, res)=> {
        res.send(`Esta es una pagina autenticada. Hola ${req.user[0].firstname}!`);
    })
    router.get('/adminonly', middlewares.authorizateUser, (req, res)=> {
        res.send(`Esta es una pagina que requiere autorizacion. Hola Admin!`);
    })*/

    app.use('/', router);
}
