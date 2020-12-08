/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require("../config/db_config");

const sendErrorStatus = (res, status, message, code) => {
    res.status(status).json({
        "error":{
            "status"  : status,
            "message" : message,
            "code"    : code
        }
    })
};

/*---------------------------------------------ORDERS--------------------------------------------*/
/*-----------------ADD A ORDER-----------------*/
exports.addOne = (req,res) => {
    /*getting all products info to: 
    -make the order description
    -make the order total payment (I dont know if this is needed because the client should know before this info is sent to the back-end)
    -make array of objects to send to the join db products_orders
    */
   if (req.body.payment === "efectivo" || req.body.payment === "credito" || req.body.payment === "debito") {
       if(req.body.payment === undefined || req.body.products === undefined || req.body.products[0] === undefined || req.body.products[0].product_id === undefined || req.body.products[0].product_quantity === undefined){
            sendErrorStatus(res, 400, `Missing information`, "MISSING_DATA");
        } else {
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
                            sendErrorStatus(res, 404, "One or more of the products sent doesn't exist", "INCORRECT_DATA");
                        } else if (isNaN(current_product_quantity)) {
                            sendErrorStatus(res, 400, "One or more of the product quantities sent is not a number", "INCORRECT_DATA");
                        }else {
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
                        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                    })
                };
            }
            get();
            function insert(products_order, description, total_price){
                let order = {
                    description : description,
                    payment     : req.body.payment,
                    order_state : "nuevo",
                    total_price : total_price,
                    user_id     : req.user[0].user_id
                };
                let sql = 
                    `INSERT INTO orders
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
                        address    : req.user[0].address,
                        phone      : req.user[0].phone,
                        password   : req.user[0].password,
                        last_order : result[0],
                        is_admin   : req.user[0].is_admin
                    };
                    let sql =  
                        `UPDATE users 
                        SET user_id = :user_id, username = :username, firstname = :firstname, lastname = :lastname, email = :email, address = :address, phone = :phone, password = :password, last_order = :last_order, is_admin = :is_admin
                        WHERE user_id = :user_id`;
                    sequelize.query( sql, {
                        replacements: changed_user
                    }).then((update_user_result) => {
                        products_order.forEach(product => {
                            product["order_id"] = result[0];
                            let sql =  
                                `INSERT INTO products_orders 
                                SET order_id= :order_id, product_id = :product_id, product_quantity = :product_quantity, user_id = :user_id`;
                            sequelize.query( sql, {
                                replacements: product
                            }).catch((err) => {
                                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                            })
                        })
                        res.status(200).json({"message":"order created", "order_id":result[0]});
                    }).catch((err)=>{
                        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                    })
                }).catch((err)=>{
                    sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                })
            }
        }
    } else {
        sendErrorStatus(res, 400, "payment value is incorrect", "INCORRECT_DATA");
    }
}

/*-----------------SEE ALL ORDERS-----------------*/
exports.findAll = (req, res) => {
    function seeAllOrders (sqlQuery) {
         let sql = sqlQuery;
        sequelize.query( sql, {
            type:sequelize.QueryTypes.SELECT
        }).then(all_orders => {
            if (all_orders.length === 0) {
                sendErrorStatus(res, 404, "Database doesn't have any order yet", "NOT_EXIST");
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
                        time: all_orders[i].time,
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
                    } else if (i === (all_orders.length - 1) || all_orders[i].order_id !== all_orders[i + 1].order_id) { 
                        createProduct(i);
                        order.products.push(product);
                        orders.push(order);
                    } else {
                        createProduct(i);
                        order.products.push(product);
                    }
                }
                res.status(200).json(orders);
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    }
    if(req.user[0].is_admin){
        let sql =  
            `SELECT * FROM orders 
            INNER JOIN products_orders ON products_orders.order_id = orders.order_id 
            INNER JOIN products ON products_orders.product_id = products.product_id`;
        seeAllOrders (sql);
    } else {
        let sql =  
            `SELECT * FROM orders 
            INNER JOIN products_orders ON products_orders.order_id = orders.order_id 
            INNER JOIN products ON products_orders.product_id = products.product_id 
            WHERE orders.user_id = ${req.user[0].user_id}`;
        seeAllOrders (sql);
    }
}

/*-----------------SEE ALL ORDERS SORTED BY ORDER_STATE o HOUR-----------------*/
/*exports.findAllSorted = (req, res) => {
    console.log(req.query.order_by );
    let sql =  `SELECT * FROM orders 
                INNER JOIN products_orders ON products_orders.order_id = orders.order_id 
                INNER JOIN products ON products_orders.product_id = products.product_id
                ORDER BY orders.`;
    sql +=  req.query.order_by === "hour" && req.query.sort_direction === "ASC"  
            ? `date DESC, orders.hour ASC`: 
            req.query.order_by === "hour" && req.query.sort_direction === "DESC"  
            ? `date DESC, orders.hour DESC`: 
            req.query.order_by  === "order_state" && req.query.sort_direction === "ASC" 
            ? `order_state ASC`:
            req.query.order_by  === "order_state" && req.query.sort_direction === "DESC" 
            ? `order_state DESC`:
            "error";
    if (sql.includes("error") === false) {
        sequelize.query( sql, {
            type:sequelize.QueryTypes.SELECT
        }).then(all_orders => {
            if (all_orders.length === 0) {
                res.status(404).json(
                    {"error": 
                        {"status": "404",
                        "message": "database doesn't have any order yet"
                        }
                    }
                )
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
                    } else if (i === (all_orders.length - 1) || all_orders[i].order_id !== all_orders[i + 1].order_id) { 
                        createProduct(i);
                        order.products.push(product);
                        orders.push(order);
                    } else {
                        createProduct(i);
                        order.products.push(product);
                    }
                }
                res.status(200).json(orders);
            }
        }).catch((err)=>{
            res.status(500).json(
                {"error": 
                    {"status": "500",
                    "message": "Internal Server Error: " + err
                    }
                }
            )
        })
    } else {
        res.status(400).json(
            {"error": 
                {"status": "400",
                "message": "one or both of the querie values sent is incorrect"
                }
            }
        )
    }
}*/


/*-----------------SEE A ORDER-----------------*/
exports.findOne = (req, res) => {
    let sql =  
        `SELECT *
        FROM orders 
        INNER JOIN products_orders ON products_orders.order_id = orders.order_id 
        INNER JOIN products ON products_orders.product_id = products.product_id 
        WHERE orders.order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(result_order => {
        if (result_order.length === 0) {
            sendErrorStatus(res, 404,  `database doesn't have any order with the id: ${req.params.id}`, "NOT_EXISTS");
        } else {
            if(req.user[0].user_id === result_order[0].user_id || req.user[0].is_admin){
                let order = {
                    order_id: result_order[0].order_id,
                    description: result_order[0].description,
                    payment: result_order[0].payment,
                    order_state: result_order[0].order_state,
                    time: result_order[0].time,
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
                res.status(200).json(order);
            } else {
                sendErrorStatus(res, 403, "User not authorized to use this resource", "NO_AUTH"); 
            }
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}

/*-----------------UPDATE A ORDER-----------------*/
/*only order_state can be changed*/
exports.updateOne = (req,res) => {
    if (   req.body.order_state === "nuevo" 
        || req.body.order_state === "confirmado" 
        || req.body.order_state === "preparando" 
        || req.body.order_state === "enviando" 
        || req.body.order_state === "entregado"  
        || req.body.order_state === "cancelado"){

        let sql =  
            `UPDATE orders 
            SET  order_state = :order_state
            WHERE order_id = :order_id`;            
        sequelize.query( sql, {
            replacements: {order_state: req.body.order_state, order_id: req.params.id}
        }).then(order => {
            /* the order doenst exists or order_state was changed to the same value*/
            if (order[0].affectedRows === 0) {
                sendErrorStatus(res, 404, `Order doesn't exist in our database or the order already had the order state value given in the request`, "NOT_EXIST");
            } else {
                res.status(200).json((`Successfully changed state of the order with the id ${req.params.id} to '${req.body.order_state}'`));
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    } else {
        sendErrorStatus(res, 400, "order_state value sent is not valid", "INCORRECT_DATA");
    }
}

/*-----------------DELETE A ORDER-----------------*/
exports.deleteOne = (req,res) => {
    let sql =  
        `DELETE orders, products_orders 
        FROM orders
        INNER JOIN products_orders 
            ON orders.order_id = products_orders.order_id
        WHERE orders.order_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id]
    }).then((order_result) => {
        if (order_result[0].affectedRows === 0) {
            sendErrorStatus(res, 404, `database doesn't have an order with the id: ${req.params.id}`, "NOT_EXIST");
        } else {
            /*Erased from user as last_order*/
            let sql =  
                `UPDATE users 
                SET last_order = ?
                WHERE last_order = ?`;
            sequelize.query( sql, {
                replacements: ["0", req.params.id]
            }).then(result => {
                res.status(200).json(`Successfully deleted order with the id: ${req.params.id}`);
            }).catch((err)=>{
                sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
            })           
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}