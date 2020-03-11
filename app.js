/*password no parece ser sensible a Mayus..averiguar*/
/*encriptar password en la db*/

/*validar que en creacion de usuarios no se repita mail/usuario ya existente*/
/*validar que en creacion de usuarios no se repita abreviacin/(descripcion tal vez tmbn) ya existente*/
/*agregar que estos elementos son unicos en la info de la db*/

/*deberian administradores poder eliminar usuarios?*/

/*Validar existencia de productos al crear un pedido*/

/*ordernar json de ver un pedido*/

/*cambiar get de pedidos para que te info tmbn de productos como lo hace el get de un pedido*/ 

/*pensar mejor el contenido de los catchs*/
/*check that all necessary info is sent*/
/*check that updates dont change elements unique column values to repeated ones*/

let express    = require('express'),
    app        = express(),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    jwt        = require('jsonwebtoken'),
    Sequelize = require('sequelize');

/*---------------------------------------------CONNECTION TO DB---------------------------------------------*/
/*-----------------CREATE CONNECTION TO DB-----------------*/
const sequelize = new Sequelize('mysql://root:@localhost:3306/delilah_resto2');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*---------------------------------------------MIDDLEWARES--------------------------------------------*/
/*-----------------JWT PASSWORD-----------------*/
const jwtPass = 'uNpASSWORDuNp0c0Malo97531';
/*-----------------AUTHENTICATE A USER-----------------*/
const authenticateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        res.status(401).send('Error: Error al validar usuario, ingrese a su cuenta para ver esta pagina');
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = jwt.verify(token, jwtPass);
        let sql =  `SELECT * FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            if(user === undefined  || !(user.length > 0)){
                res.status(401).send('Error: Error al validar usuario, ingrese a su cuenta para ver esta pagina');
            } else {
                /*user data is sent to routes that use this middleware in the request. Way of access: For example, access to user first name req.user[0].firstname !remember: info is sent as an array*/
                req.user = user;
                next();
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    }
}

/*-----------------AUTHORIZATE A USER-----------------*/
const authorizateUser = (req, res, next) => {
    if(req.headers.authorization === undefined){
        /*403 or 401? Beacause if theres no header there hasnt been a log in*/
        res.status(403).send('Error: No tiene acceso a esta pagina');
    } else {
        const token = req.headers.authorization.split(' ')[1];
        const verifiedToken = jwt.verify(token, jwtPass);
        let sql =  `SELECT * FROM users 
                    WHERE user_id = ? 
                    AND is_admin = 'TRUE'`;
        sequelize.query( sql, {
            replacements: [verifiedToken.user_id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            console.log(user);
            if(user === undefined  || !(user.length > 0)){
                res.status(403).send('Error: No tiene acceso a esta pagina');
            } else{
                /*is given access to existent users that have ADMIN ROL*/
                next();
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    }
}



/*---------------------------------------------USERS--------------------------------------------*/
/*-----------------ADD A USER-----------------*/
app.post('/users', (req,res) => {
    let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                        FROM users 
                        WHERE username = ? OR email = ?`;
    sequelize.query( sql, {
        replacements: [req.body.username, req.body.email], type:sequelize.QueryTypes.SELECT
    }).then(repeated_user => {
        console.log(repeated_user);
        if (repeated_user.length === 0) {
            let user = {
                user_id    : null,
                username   : req.body.username,
                firstname  : req.body.firstname,
                lastname   : req.body.lastname,
                email      : req.body.email,
                adress     : req.body.adress,
                phone      : req.body.phone,
                password   : req.body.password,
                last_order : 0,
                is_admin   : 'FALSE'
            };
            let sql = `INSERT INTO users VALUES (:user_id, :username, :firstname, :lastname, :email, :adress, :phone, :password, :last_order, :is_admin)`;
            sequelize.query( sql, {
                replacements: user
            }).then(result => {
                console.log(result[0]);
                user.user_id = result[0];
                delete user.password;
                res.json(user);
                /*it should also return the token so it can be already logged in ?*/
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
        } else {
            //error handling when there is/are repeated username and/or email
            let email = 0;
            let name = 0;
            //checking what is repeated
            repeated_user.forEach(oneUser => {
                if (oneUser.username === req.body.username && oneUser.email === req.body.email) {
                    email++;
                    name++;
                } else if (oneUser.username === req.body.username) {
                    name++;
                } else if (oneUser.email === req.body.email) {
                    email++;
                } 
            });
            //sending error message
            if (email > 0 && name > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre y email`);
            } else if (name > 0) {
                res.status(400).send(`Error: ya existe un usuario con este nombre`);
            } else if (email > 0) {
                res.status(400).send(`Error: ya existe un usuario con este email`);
            } else {
                res.status(400).send(`Error: ya existe un usuario con este nombre o email`);
            }
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/*example of info to send in the body:
{
    "username": "LukeSky",
    "firstname": "Luke",
    "lastname": "Skywalker",
    "email": "lukeskywalker@jedi.sw",
    "adress": "526 Tatooine",
    "phone": 1545879563,
    "last_order": 0,
    "password": "Luke"
}
{
    "username": "Leia",
    "firstname": "Leia",
    "lastname": "Organa",
    "email": "leiaorgana@kindajedi.sw",
    "adress": "326 Alderaan",
    "phone": 1512549563,
    "password": "Leia"
}
*/

/*-----------------SEE ALL USERS(eliminate)-----------------*/
/*app.get('/users', authorizateUser, (req,res) => {
    let sql = `SELECT username, firstname, lastname, email, adress, phone FROM users WHERE is_admin = 'FALSE'`;
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_users => {
        if (all_users.length === 0) {
            res.status(404).send(`Error: no existe ningún usuarios`)
        } else {
            res.json(all_users);
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})*/

/*-----------------SEE A USER-----------------*/
app.get('/users/:id', authenticateUser, (req,res) => {
    if(req.user[0].user_id == req.params.id || req.user[0].is_admin === 'TRUE'){
        let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                        FROM users 
                        WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(user => {
            console.log(user);
            if (user.length === 0) {
                res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
            } else {
                res.json(user);
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado a ver esta información");
    }
})

/*-----------------UPDATE A USER-----------------*/
//need to check if email and username doesnt already exists
app.put('/users/:id', authenticateUser, (req,res) => {
    if(req.user[0].user_id == req.params.id){
        /*Search for the current user object*/
        let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, password, is_admin
                    FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
        }).then(result => {
            if (result.length > 0) {
                let current_user = result;
                /*Added conditional in case the request body doesnt send all the users information, in the case of a info not being given it sends the same info that was already in the db*/
                let changed_user = {
                    user_id    : req.params.id,
                    username   : req.body.username   !== undefined ? req.body.username   : current_user[0].username,
                    firstname  : req.body.firstname  !== undefined ? req.body.firstname  : current_user[0].firstname,
                    lastname   : req.body.lastname   !== undefined ? req.body.lastname   : current_user[0].lastname,
                    email      : req.body.email      !== undefined ? req.body.email      : current_user[0].email,
                    adress     : req.body.adress     !== undefined ? req.body.adress     : current_user[0].adress,
                    phone      : req.body.phone      !== undefined ? req.body.phone      : current_user[0].phone,
                    password   : req.body.password   !== undefined ? req.body.password   : current_user[0].password,
                    last_order : req.body.last_order !== undefined ? req.body.last_order : current_user[0].last_order,
                    is_admin   : current_user[0].is_admin
                };
                let sql =  `UPDATE users SET username = :username, firstname = :firstname, lastname = :lastname, email = :email, adress = :adress, phone = :phone, password = :password, last_order = :last_order, is_admin = :is_admin
                            WHERE user_id = :user_id`;
                sequelize.query( sql, {
                    replacements: changed_user
                }).then(result => {
                    delete changed_user.password;
                    res.json(changed_user);
                    /*
                    let sql =  `SELECT username, firstname, lastname, email, adress, phone, last_order, is_admin 
                    FROM users 
                    WHERE user_id = ?`;
                    sequelize.query( sql, {
                        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
                    }).then(new_user => {
                        console.log(new_user);
                        if (new_user.length === 0) {
                            res.status(404).send(`Error: no hay usuario con el id ${req.params.id}`)
                        } else {
                            res.json(new_user);
                        }
                    }).catch((err)=>{
                        console.log(err);
                        res.status(500);
                        res.render('error', { error: err });
                    })     */
                }).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.render('error', { error: err });
                })           
            } else {
                res.send(`Error: no hay usuario con el id ${req.params.id}`)
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para modificar esta información");
    }
})

/*example of info to send in the body:
{
    "username": "LukeSky",
    "firstname": "Luke",
    "adress": "1528 Tatooine",
    "phone": 1545879563,
}
{
    "email": "leiaorgana@starwars.com",
}
*/

/*-----------------DELETE A USER-----------------*/
app.delete('/users/:id', authenticateUser, (req, res) => {
    if(req.user[0].user_id == req.params.id){
        let sql =  `DELETE FROM users 
                    WHERE user_id = ?`;
        sequelize.query( sql, {
            replacements: [req.params.id]
        }).then(deleted_user => {
            res.json(`Eliminado con éxito usuario con id: ${req.params.id}`);
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    } else {
        res.status(403).send("Error: no se encuentra autorizado para eliminar este usuario");
    }
})

/*---------------------------------------------PRODUCTS---------------------------------------------*/
/*-----------------ADD A PRODUCT-----------------*/
app.post('/products', authorizateUser, (req,res) => {
    let product = {
        product_name : req.body.product_name,
        abbreviation : req.body.abbreviation,
        link_img     : req.body.link_img,
        price        : req.body.price
    };

    let sql = 'INSERT INTO products SET product_name = :product_name, abbreviation = :abbreviation, link_img = :link_img, price = :price';
    sequelize.query( sql, {
        replacements: product
    }).then(result => {
        console.log(result);
        let sql =  `SELECT * FROM products 
                    WHERE product_id = ?`;
        sequelize.query( sql, {
            replacements: [result[0]], type:sequelize.QueryTypes.SELECT
        }).then(new_product => {
            res.json(new_product);
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/*example of info to send in the body:
{
    "product_name":"Hamburguesa Veggie", 
    "abbreviation":"HamVeg", 
    "link_img":"https://images.unsplash.com/photo-1540265556701-ae209ac395cd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60", 
    "price":"340"
}*/

/*-----------------SEE ALL PRODUCTS-----------------*/
app.get('/products', authenticateUser, (req,res) => {
    let sql = 'SELECT * FROM products';
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(products => {
        console.log(products);
        if (products.length === 0) {
            res.status(404).send("No hay productos en esta base de datos");
        } else {
            res.json(products);
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/*-----------------SEE A PRODUCT-----------------*/
app.get('/products/:id', authenticateUser, (req,res) => {
    let sql =  `SELECT * FROM products 
                WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(product => {
        console.log(product);
        if (product.length === 0) {
            res.status(404).send("Producto no existente");
        } else {
            res.json(product);
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/*-----------------UPDATE A PRODUCT-----------------*/
app.put('/products/:id', authorizateUser, (req, res) => {
    let sql =  `SELECT * FROM products 
                WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(product => {
        console.log(product);
        if (product.length === 0) {
            res.status(404).send("Producto no existente");
        } else {
            let current_product = product;
            /*Conditional in case not all the info is sent in the body is added*/
            let changed_product = {
                product_name : req.body.product_name !== undefined ? req.body.product_name : current_product[0].product_name,
                abbreviation : req.body.abbreviation !== undefined ? req.body.abbreviation : current_product[0].abbreviation,
                link_img     : req.body.link_img !== undefined ? req.body.link_img : current_product[0].link_img,
                price        : req.body.price !== undefined ? req.body.price : current_product[0].price,
                product_id   : current_product[0].product_id

            };
            let sql =  `UPDATE products 
                        SET product_name = :product_name, abbreviation = :abbreviation, link_img = :link_img, price = :price
                        WHERE product_id = :product_id `;

            sequelize.query( sql, {
                replacements: changed_product
            }).then(update_result => {
                let sql =  `SELECT * FROM products 
                            WHERE product_id = ?`;
                sequelize.query( sql, {
                    replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
                }).then(updated_product => {
                    res.json(updated_product);
                }).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.render('error', { error: err });
                })
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/* example of info to send in the body:   
{
    "product_name" : "Agua mineral",
    "abbreviation" : "Agua",
    "link_img" : "https://images.unsplash.com/photo-1546498159-9a2fac87e770?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
    "price" : 60
}
*/

/*-----------------DELETE A PRODUCT-----------------*/
app.delete('/products/:id', authorizateUser, (req,res) => {
    let sql =  `DELETE FROM products 
                WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id]
    }).then(product => {
        if (product[0].affectedRows === 0) {
            res.status(404).send("Producto no existente");
        } else {
            res.json(`Eliminado con éxito producto con id: ${req.params.id}`);
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/*---------------------------------------------ORDERS---------------------------------------------*/
/*-----------------ADD AN ORDER-----------------*/
app.post('/orders', authenticateUser, (req,res) => {
    /*getting all products info to: 
    -make the order description
    -make the order total payment (I dont know if this is needed because the client should know before this info is sent to the back-end)
    -make array of objects to send to the join db products_orders
    */
    let description = "";
    let products_order = [];
    let total_price = 0;
    async function get(){
        let product_quantity = Object.keys(req.body.products).length;
        let product_number = 0;
        for(let id in req.body.products){
            let sql = `SELECT * FROM products WHERE product_id = ?`;
            await sequelize.query( sql, {
                replacements: [id], type:sequelize.QueryTypes.SELECT
            }).then(result => {
                product_number += 1;
                description += req.body.products[id] + "x" + result[0].abbreviation + " ";
                total_price += req.body.products[id]*(+result[0].price);
                products_order.push({
                    "product_id"      : id,
                    "product_quantity": req.body.products[id],
                    "user_id"         : req.user[0].user_id
                })
                /*Checking for the last iteration so the info can be sent to be inserted in the order and products_orders tables */
                if(product_number === product_quantity){
                    insert(products_order, description, total_price);
                }
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
        };
    }
    get();
    function insert(products_order, description, total_price){
        let order = {
            description : description,
            payment     : req.body.payment,
            order_state : 'nuevo',
            total_price : total_price,
            user_id     : req.user[0].user_id
        };
        let sql = 'INSERT INTO orders SET description = :description, payment = :payment, order_state = :order_state, total_price= :total_price, user_id = :user_id';
        sequelize.query( sql, {
            replacements: order
        }).then(result => {
            let changed_user = {
                user_id    : req.user[0].user_id,
                username   : req.user[0].username,
                firstname  : req.user[0].firstname,
                lastname   : req.user[0].lastname,
                email      : req.user[0].email,
                adress     : req.user[0].adress,
                phone      : req.user[0].phone,
                password   : req.user[0].password,
                last_order : result[0],
                is_admin   : req.user[0].is_admin
            };
            let sql =  `UPDATE users SET user_id = :user_id, username = :username, firstname = :firstname, lastname = :lastname, email = :email, adress = :adress, phone = :phone, password = :password, last_order = :last_order, is_admin = :is_admin
                        WHERE user_id = :user_id`;
            sequelize.query( sql, {
                replacements: changed_user
            }).then((result) => {
                console.log(result);
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
            products_order.forEach(product => {
                product["order_id"] = result[0];
                let sql = `INSERT INTO products_orders SET order_id= :order_id, product_id = :product_id, product_quantity = :product_quantity, user_id = :user_id`;
                sequelize.query( sql, {
                    replacements: product
                }).then((result)=>{
                    console.log(result);
                }).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.render('error', { error: err });
                })
            })
            res.status(200).send('Pedido creado');
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.render('error', { error: err });
        })
    }
})

/*example of info to send in the body:
{
    "payment": "efectivo",
    "products": {
    	"34": 3,
        "2": 1
    }
}*/

/*-----------------SEE ALL ORDERS-----------------*/
app.get('/orders', authorizateUser, (req, res) => {
    let sql = 'SELECT * FROM orders';
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_orders => {
        if (all_orders.length === 0) {
            res.status(404).send(`Error: no hay ningún pedido en la base de datos`);
        } else {
            let orders = [];
            for(let i = 0; i < all_orders.length; i++){
                let current_order = {};
                current_order.pedido = all_orders[i];
                function save_products (allproducts) {
                    current_order.pedido.productos = allproducts;
                    orders.push(current_order);
                }
                let sql =  `SELECT * FROM products_orders 
                            WHERE order_id = ?`;
                sequelize.query( sql, {
                    replacements: [all_orders[i].order_id], type:sequelize.QueryTypes.SELECT
                }).then(result_order_products => {
                    console.log(result_order_products)
                    let allproducts = [];
                    for(let h = 0; h < result_order_products.length; h++){
                        let sql =  `SELECT * FROM products 
                                    WHERE product_id = ?`;
                        sequelize.query( sql, {
                            replacements: [result_order_products[h].product_id], type:sequelize.QueryTypes.SELECT
                        }).then(result_product => {
                            allproducts.push({
                                "quantity"     : result_order_products[h].product_quantity,
                                "product_id"   : result_product[0].product_id,
                                "product_name" : result_product[0].product_name,
                                "abbreviation" : result_product[0].abbreviation,
                                "link_img"     : result_product[0].link_img,
                                "price"        : result_product[0].price
                            });
                            if (h === (result_order_products.length - 1)) {
                                save_products(allproducts);
                            }
                            if (i === (all_orders.length - 1)) {
                                send_json(orders);
                            }
                        }).catch((err)=>{
                            console.log(err);
                            res.status(500);
                            res.render('error', { error: err });
                        })
                    }
                }).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.render('error', { error: err });
                })
            };
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
    function send_json (orders){
        console.log(orders);
        res.json({'pedidos': orders});
    }
})

/*-----------------SEE A ORDER-----------------*/
app.get('/orders/:id', authenticateUser, (req, res) => {
    let sql =  `SELECT * FROM orders 
                WHERE order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(result_order => {
        order = {};
        order.pedido = result_order[0];
        if (result_order.length === 0) {
            res.status(404).send("Pedido no existente");
        } else {
            if(req.user[0].user_id === result_order[0].user_id || req.user[0].is_admin === 'TRUE'){
                let sql =  `SELECT * FROM products_orders 
                WHERE order_id = ?`;
                sequelize.query( sql, {
                    replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
                }).then(result_order_products => {
                    let allproducts = [];
                    for(let i = 0; i < result_order_products.length; i++){
                        let sql =  `SELECT * FROM products 
                                    WHERE product_id = ?`;
                        sequelize.query( sql, {
                            replacements: [result_order_products[i].product_id], type:sequelize.QueryTypes.SELECT
                        }).then(result_product => {
                            allproducts.push({
                                "quantity"     : result_order_products[i].product_quantity,
                                "product_id"   : result_product[0].product_id,
                                "product_name" : result_product[0].product_name,
                                "abbreviation" : result_product[0].abbreviation,
                                "link_img"     : result_product[0].link_img,
                                "price"        : result_product[0].price
                            });
                            if (i === (result_order_products.length - 1)) {
                                send_json(order, allproducts);
                            }
                        }).catch((err)=>{
                            console.log(err);
                            res.status(500);
                            res.render('error', { error: err });
                        })
                    }
                }).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.render('error', { error: err });
                })
            } else {
                res.status(403).send("Error: no se encuentra autorizado para ver esta información");
            }
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
    function send_json (order, allproducts){
        order.pedido.productos = allproducts;
        console.log(order);
        res.json(order);
    }
})

/*-----------------UPDATE A ORDER-----------------*/
app.put('/orders/:id', authorizateUser, (req,res) => {
    let sql =  `SELECT * FROM orders 
                WHERE order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(current_order => {
        if (current_order.length === 0) {
            res.status(404).send("Pedido no existente");
        } else {
            let changed_order = {
                order_id    : req.params.id,
                description : current_order[0].description,
                payment     : current_order[0].payment,
                order_state : req.body.order_state !== undefined ? req.body.order_state : current_order[0].order_state,
                total_price : current_order[0].total_price,
                user_id     : current_order[0].user_id
            };
            let sql =  `UPDATE orders 
                        SET  description = :description, payment = :payment, order_state = :order_state, total_price= :total_price, user_id = :user_id
                        WHERE order_id = :order_id`;
            sequelize.query( sql, {
                replacements: changed_order
            }).then(order => {
                console.log(order);
                res.json((`Cambiado con éxito estado de pedido con id ${req.params.id} a '${changed_order.order_state}'`));
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
});

/*example of info to send in the body:
{
    "order_state" : "cancelado"
}*/

/*-----------------DELETE A ORDER-----------------*/
app.delete('/orders/:id', authorizateUser, (req,res) => {
    let sql =  `DELETE FROM orders
                WHERE order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id]
    }).then((order_result) => {
        if (order_result[0].affectedRows === 0) {
            res.status(404).send("Pedido no existente");
        } else {
            let sql =  `DELETE FROM products_orders
                WHERE order_id = ?`;
            sequelize.query( sql, {
                replacements: [req.params.id]
            }).then((product_result) => {
                if (product_result[0].affectedRows === 0) {
                    res.status(404).send("Pedido no existente");
                } else {
                    res.json(product_result);
                    /*hace falta agregarle que chequee si el usuario al q corresponde lo tiene como ultima orden en cuyo caso borrarsela*/
                }
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.render('error', { error: err });
            })
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })

})

/*---------------------------------------------USER LOG IN---------------------------------------------*/
app.post('/login', (req,res)=> {
    let sql =  `SELECT * FROM users 
                WHERE (username = :username OR email = :email) 
                AND password = :password`;
    sequelize.query( sql, {
        replacements: {username : req.body.username , email: req.body.username,password : req.body.password}, type:sequelize.QueryTypes.SELECT
    }).then(result => {
        /*error management*/
        if(result === undefined  || !(result.length > 0)){
            res.status(401).send('Error: Datos incorrectos');
        } else{
            /*token created and sent when correct data is given*/
            let user_id = result[0].user_id;
            console.log(result);
            const token = jwt.sign({
                user_id,
            }, jwtPass);
            res.json({token: token, user_id: user_id});
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
})

/*-----------------ROUTES EXAMPLE USING THE EXISTENT MIDDLEWARES(eliminar)-----------------*/
/*app.get('/secure', authenticateUser, (req, res)=> {
    res.send(`Esta es una pagina autenticada. Hola ${req.user[0].firstname}!`);
})
app.get('/adminonly', authorizateUser, (req, res)=> {
    res.send(`Esta es una pagina que requiere autorizacion. Hola Admin!`);
})*/


/*---------------------------------------------LISTENER CREATED IN PORT 3000--------------------------------------------*/
app.listen(3000, ()=> {
    console.log('Server 3000 is working');
})