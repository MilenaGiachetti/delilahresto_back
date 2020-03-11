
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

exports.addOne = (req,res) => {
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
}

exports.findAll = (req, res) => {
    let sql =  `SELECT *
                FROM orders 
                INNER JOIN products_orders ON products_orders.order_id = orders.order_id 
                INNER JOIN products ON products_orders.product_id = products.product_id`;
    sequelize.query( sql, {
        type:sequelize.QueryTypes.SELECT
    }).then(all_orders => {
        if (all_orders.length === 0) {
            res.status(404).send(`Error: no hay ningún pedido en la base de datos`);
        } else {
            let orders = [];
            let order;
            let product;
            function createProduct (i) {
                product = {
                    product_quantity: all_orders[i].product_quantity,
                    product_id: all_orders[i].product_id,
                    product_name: all_orders[i].product_name,
                    abbreviation: all_orders[i].abbreviation,
                    link_img: all_orders[i].link_img,
                    price:  all_orders[i].price
                }
            }
            function createOrder (i) {
                order = {
                    order_id: all_orders[i].order_id,
                    description: all_orders[i].description,
                    payment: all_orders[i].payment,
                    order_state: all_orders[i].order_state,
                    date: all_orders[i].date,
                    hour: all_orders[i].hour,
                    total_price: all_orders[i].total_price,
                    user_id: all_orders[i].user_id,
                    products: []
                }
            }
            for (let i = 0; i < all_orders.length; i++){
                if (i === 0 || all_orders[i].order_id !== all_orders[i - 1].order_id){
                    createOrder(i);
                    createProduct(i);
                    order.products.push(product);
                    if (i === (all_orders.length - 1) || all_orders[i].order_id !== all_orders[i + 1].order_id) {
                        orders.push(order);
                    }
                } else if (all_orders[i].order_id !== all_orders[i + 1].order_id) { 
                    createProduct(i);
                    order.products.push(product);
                    orders.push(order);
                } else {
                    createProduct(i);
                    order.products.push(product);
                }
            }
            res.json(orders);
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
}

exports.findOne = (req, res) => {
    let sql =  `SELECT *
                FROM orders 
                INNER JOIN products_orders ON products_orders.order_id = orders.order_id 
                INNER JOIN products ON products_orders.product_id = products.product_id 
                WHERE orders.order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(result_order => {
        if (result_order.length === 0) {
            res.status(404).send("Pedido no existente");
        } else {
            if(req.user[0].user_id === result_order[0].user_id || req.user[0].is_admin === 'TRUE'){
                let order = {
                    order_id: result_order[0].order_id,
                    description: result_order[0].description,
                    payment: result_order[0].payment,
                    order_state: result_order[0].order_state,
                    date: result_order[0].date,
                    hour: result_order[0].hour,
                    total_price: result_order[0].total_price,
                    user_id: result_order[0].user_id,
                    products: []
                }
                for(let i = 0; i < result_order.length; i++){
                    let product = {
                        product_quantity: result_order[i].product_quantity,
                        product_id: result_order[i].product_id,
                        product_name: result_order[i].product_name,
                        abbreviation: result_order[i].abbreviation,
                        link_img: result_order[i].link_img,
                        price:  result_order[i].price
                    }
                    order.products.push(product);
                }
                console.log(order);
                res.json(order);
            } else {
                res.status(403).send("Error: no se encuentra autorizado para ver esta información");
            }
        }
    }).catch((err)=>{
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
}

exports.updateOne = (req,res) => {
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
}

exports.deleteOne = (req,res) => {
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
}