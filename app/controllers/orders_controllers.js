/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require('../config/db_config');

/*---------------------------------------------ORDERS--------------------------------------------*/
/*-----------------ADD A ORDER-----------------*/
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
        let total_product_quantity = req.body.products.length;
        let product_number = 0;
        for(let i = 0; i < total_product_quantity; i++){
            let current_product_id = req.body.products[i].product_id;
            let current_product_quantity =req.body.products[i].product_quantity;
            
            let sql = `SELECT * FROM products WHERE product_id = ?`;
            await sequelize.query( sql, {
                replacements: [current_product_id], type:sequelize.QueryTypes.SELECT
            }).then(result => {
                if( result[0] === undefined ) {
                    res.status(404).send('Error: uno o más de los productos enviados en el pedido no existen');
                } else {
                    product_number += 1;
                    description += current_product_quantity + "x" + result[0].abbreviation + " ";
                    total_price += current_product_quantity*(+result[0].price);
                    products_order.push({
                        "product_id"       : current_product_id,
                        "product_quantity" : current_product_quantity,
                        "user_id"          : req.user[0].user_id
                    })
                    /*Checking for the last iteration so the info can be sent to be inserted in the order and products_orders tables */
                    if(product_number === total_product_quantity){
                        insert(products_order, description, total_price);
                    }
                }
            }).catch((err)=>{
                res.status(500).send( 'Error: ' + err );
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
        let sql = `INSERT INTO orders
                   SET description = :description, payment = :payment, order_state = :order_state, total_price= :total_price, user_id = :user_id`;
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
            let sql =  `UPDATE users 
                        SET user_id = :user_id, username = :username, firstname = :firstname, lastname = :lastname, email = :email, adress = :adress, phone = :phone, password = :password, last_order = :last_order, is_admin = :is_admin
                        WHERE user_id = :user_id`;
            sequelize.query( sql, {
                replacements: changed_user
            }).then((update_user_result) => {
                products_order.forEach(product => {
                    product["order_id"] = result[0];
                    let sql =  `INSERT INTO products_orders 
                                SET order_id= :order_id, product_id = :product_id, product_quantity = :product_quantity, user_id = :user_id`;
                    sequelize.query( sql, {
                        replacements: product
                    }).catch((err) => {
                        res.status(500).send( 'Error: ' + err );
                    })
                })
                res.status(200).send('Pedido creado');
            }).catch((err)=>{
                res.status(500).send( 'Error: ' + err );
            })
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    }
}

/*-----------------SEE ALL ORDERS-----------------*/
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
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------SEE A ORDER-----------------*/
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
            res.status(404).send("Error: Pedido no existente");
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
                res.json(order);
            } else {
                res.status(403).send("Error: no se encuentra autorizado para ver esta información");
            }
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------UPDATE A ORDER-----------------*/
/*only order_state can be changed*/
exports.updateOne = (req,res) => {
    if (   req.body.order_state === 'nuevo' 
        || req.body.order_state === 'confirmado' 
        || req.body.order_state === 'preparando' 
        || req.body.order_state === 'enviando' 
        || req.body.order_state === 'entregado'  
        || req.body.order_state === 'cancelado'){

        let sql =  `UPDATE orders 
                    SET  order_state = :order_state
                    WHERE order_id = :order_id`;
                    
        sequelize.query( sql, {
            replacements: {order_state: req.body.order_state, order_id: req.params.id}
        }).then(order => {
            /* the order doenst exists or order_state was changed to the same value*/
            if (order[0].affectedRows === 0) {
                res.status(400).send('Error: Orden no existente u orden ya poseía el valor dado de order_state');
            } else {
                res.json((`Cambiado con éxito estado de pedido con id ${req.params.id} a '${req.body.order_state}'`));
            }
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    } else {
        res.status(400).send('Error: Ingrese un valor de order_state válido');
    }
}

/*-----------------DELETE A ORDER-----------------*/
exports.deleteOne = (req,res) => {
    let sql =  `DELETE orders, products_orders 
                FROM orders
                INNER JOIN products_orders 
                    ON orders.order_id = products_orders.order_id
                WHERE orders.order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id]
    }).then((order_result) => {
        if (order_result[0].affectedRows === 0) {
            res.status(404).send("Error: Pedido no existente");
        } else {
            /*Erased from user as last_order*/
            let sql =  `UPDATE users 
                        SET last_order = ?
                        WHERE last_order = ?`;
            sequelize.query( sql, {
                replacements: ['0', req.params.id]
            }).then(result => {
                res.json('Eliminado con éxito pedido con id: ' + req.params.id);
            }).catch((err)=>{
                res.status(500).send( 'Error: ' + err );
            })           
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}