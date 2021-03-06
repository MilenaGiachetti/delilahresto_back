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


/*---------------------------------------------PRODUCTS--------------------------------------------*/
/*-----------------ADD A PRODUCT-----------------*/
exports.addOne = (req,res) => {
    let missingInfo = [];
    req.body.product_name !== undefined ? "" : missingInfo.push("product name");
    req.body.abbreviation !== undefined ? "" : missingInfo.push("abbreviation");
    req.body.link_img     !== undefined ? "" : missingInfo.push("link img");
    req.body.price        !== undefined ? "" : missingInfo.push("price");
    
    if (missingInfo.length === 0) {
        let sql =  
            `SELECT  *
            FROM products 
            WHERE product_name = ? OR abbreviation = ?`;
        sequelize.query( sql, {
            replacements: [req.body.product_name, req.body.abbreviation.substring(0,8)], type:sequelize.QueryTypes.SELECT
        }).then(repeated_products => {
            if (repeated_products.length === 0) {        
                let new_product = {
                    product_name : req.body.product_name,
                    abbreviation : req.body.abbreviation,
                    link_img     : req.body.link_img,
                    price        : req.body.price
                };
                let sql =  
                    `INSERT  INTO products 
                    SET product_name = :product_name, 
                        abbreviation = :abbreviation, 
                        link_img     = :link_img, 
                        price        = :price`;
                sequelize.query( sql, {
                    replacements: new_product
                }).then(result => {
                    new_product.product_id = result[0].insertId;
                    res.status(200).json(new_product);
                }).catch((err)=>{
                    sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                })
            } else {
                //error handling when there is/are repeated username and/or email
                let product_name = false;
                let abbreviation = false;
                //checking what is repeated
                repeated_products.forEach(repeated_product => {
                    product_name = (repeated_product.product_name === req.body.product_name ? true : product_name);
                    abbreviation = (repeated_product.abbreviation === req.body.abbreviation ? true : abbreviation);
                });
                //sending error message
                sendErrorStatus(res, 400, `${product_name && abbreviation ? "Product with this name and abbreviation" : (product_name ? "Product with this name" : "Product with this abbreviation")} already exists`, "REPEATED_DATA");  
            }
        }).catch((err)=>{
            sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
        })
    } else {
        sendErrorStatus(res, 400, `Missing data: ${missingInfo.join(" - ")}`, "MISSING_DATA");
    }
}

/*-----------------SEE ALL PRODUCTS-----------------*/
exports.findAll = (req,res) => {
    let sql = `SELECT * FROM products`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(products => {
        if (products.length === 0) {
            sendErrorStatus(res, 404, "Database doesn't have any product", "NOT_EXIST");
        } else {
            res.status(200).json(products);
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}

/*-----------------SEE A PRODUCT-----------------*/
exports.findOne = (req, res) => {
    let sql =  
        `SELECT * FROM products 
        WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(product => {
        if (product.length === 0) {
            sendErrorStatus(res, 404, `Product with the id ${req.params.id} doesn't exist`, "NOT_EXIST");
        } else {
            res.status(200).json(product[0]);
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}

/*-----------------UPDATE A PRODUCT-----------------*/
exports.updateOne = (req, res) => {
    let sql =  
        `SELECT * FROM products 
        WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(product => {
        if (product.length === 0) {
            sendErrorStatus(res, 404, `Product with the id ${req.params.id} doesn't exist`, "NOT_EXIST");
        } else {
            function updateProduct () {
                let current_product = product;
                /*Conditional in case not all the info is sent in the body is added*/
                let changed_product = {
                    product_id   : current_product[0].product_id,
                    product_name : req.body.product_name !== undefined ? req.body.product_name : current_product[0].product_name,
                    abbreviation : req.body.abbreviation !== undefined ? req.body.abbreviation : current_product[0].abbreviation,
                    link_img     : req.body.link_img !== undefined ? req.body.link_img : current_product[0].link_img,
                    price        : req.body.price !== undefined ? req.body.price : current_product[0].price
                };
                let sql =  
                    `UPDATE products 
                    SET product_name = :product_name, 
                        abbreviation = :abbreviation, 
                        link_img = :link_img, 
                        price = :price
                    WHERE product_id = :product_id `;
                sequelize.query( sql, {
                    replacements: changed_product
                }).then(update_result => {
                    res.status(200).json(changed_product);
                }).catch((err)=>{
                    sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                })
            }

            if (req.body.product_name !== undefined || req.body.abbreviation !== undefined ) {
                let sql =  
                    `SELECT * FROM products 
                    WHERE  (product_name = ? OR abbreviation = ?)                        AND  product_id != ?`;
                sequelize.query( sql, {
                    replacements: [req.body.product_name, req.body.abbreviation, req.params.id], type:sequelize.QueryTypes.SELECT
                }).then(repeated_products => {
                    if (repeated_products.length === 0){
                        updateProduct ();
                    } else {
                        //error handling when there is/are repeated product_name and/or abbreviation
                        let product_name = false;
                        let abbreviation = false;
                        //checking what is repeated
                        repeated_products.forEach(repeated_product => {
                            product_name = (repeated_product.product_name === req.body.product_name ? true : product_name);
                            abbreviation = (repeated_product.abbreviation === req.body.abbreviation ? true : abbreviation);
                        });
                        //sending error message
                        sendErrorStatus(res, 400, `${product_name && abbreviation ? "Product with this name and abbreviation" : (product_name ? "Product with this name" : "Product with this abbreviation")} already exists`, "REPEATED_DATA");  
                    }
                }).catch((err)=>{
                    sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
                })
            } else {
                updateProduct ();
            }
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}

/*-----------------DELETE A PRODUCT-----------------*/
exports.deleteOne = (req,res) => {
    let sql =  
        `DELETE FROM products 
        WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id]
    }).then(product => {
        if (product[0].affectedRows === 0) {
            sendErrorStatus(res, 404, `Product with id ${req.params.id} doesn't exist`, "NOT_EXIST");
        } else {
            res.status(200).json(`Successfully delete product with the id: ${req.params.id}`);
        }
    }).catch((err)=>{
        sendErrorStatus(res, 500, `Internal Server Error: ${err}`, "SERVER_ERROR");
    })
}