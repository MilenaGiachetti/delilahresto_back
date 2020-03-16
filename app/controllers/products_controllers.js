/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const sequelize = require('../config/db_config');

/*---------------------------------------------PRODUCTS--------------------------------------------*/
/*-----------------ADD A PRODUCT-----------------*/
exports.addOne = (req,res) => {
    //mensaje de error en caso de faltar info requerida 422 or 400?
    let missingInfo = [];
    req.body.product_name !== undefined ? '' : missingInfo.push(' product_name');
    req.body.abbreviation !== undefined ? '' : missingInfo.push(' abbreviation');
    req.body.link_img     !== undefined ? '' : missingInfo.push(' link_img');
    req.body.price        !== undefined ? '' : missingInfo.push(' price');
    
    if (missingInfo == '') {
        let sql =  `SELECT  *
                        FROM products 
                        WHERE product_name = ? OR abbreviation = ?`;
        sequelize.query( sql, {
            replacements: [req.body.product_name, req.body.abbreviation.substring(0,8)], type:sequelize.QueryTypes.SELECT
        }).then(repeated_product => {
            if (repeated_product.length === 0) {        
                let new_product = {
                    product_name : req.body.product_name,
                    abbreviation : req.body.abbreviation,
                    link_img     : req.body.link_img,
                    price        : req.body.price
                };
                let sql =  `INSERT  INTO products 
                                SET product_name = :product_name, 
                                    abbreviation = :abbreviation, 
                                    link_img     = :link_img, 
                                    price        = :price`;
                sequelize.query( sql, {
                    replacements: new_product
                }).then(result => {
                    new_product.product_id = result[0].insertId;
                    res.json(new_product);
                }).catch((err)=>{
                    res.status(500).send( 'Error: ' + err );
                })
            } else {
                //error handling when there is/are repeated product_name and/or abbreviation
                let product_name = 0;
                let abbreviation = 0;
                //checking what is repeated
                repeated_product.forEach(oneProduct => {
                    if (oneProduct.abbreviation === req.body.abbreviation && oneProduct.product_name === req.body.product_name) {
                        abbreviation++;
                        product_name++;
                    } else if (oneProduct.product_name === req.body.product_name) {
                        product_name++;
                    } else if (oneProduct.abbreviation === req.body.abbreviation) {
                        abbreviation++;
                    } 
                });
                //sending error message
                if (abbreviation > 0 && product_name > 0) {
                    res.status(400).send(`Error: ya existe un producto con este product_name y abbreviation`);
                } else if (product_name > 0) {
                    res.status(400).send(`Error: ya existe un producto con este product_name`);
                } else if (abbreviation > 0) {
                    res.status(400).send(`Error: ya existe un producto con este abbreviation`);
                } else {
                    res.status(400).send(`Error: ya existe un producto con este product_name o abbreviation`);
                }
            }
        }).catch((err)=>{
            res.status(500).send( 'Error: ' + err );
        })
    } else {
        res.status(400).send('Error: falta la siguiente información requerida: '+ missingInfo);
    }
}

/*-----------------SEE ALL PRODUCTS-----------------*/
exports.findAll = (req,res) => {
    let sql = 'SELECT * FROM products';
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(products => {
        if (products.length === 0) {
            res.status(404).send("No hay productos en esta base de datos");
        } else {
            res.json(products);
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------SEE A PRODUCT-----------------*/
exports.findOne = (req, res) => {
    let sql =  `SELECT * FROM products 
                WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(product => {
        if (product.length === 0) {
            res.status(404).send("Producto no existente");
        } else {
            res.json(product);
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------UPDATE A PRODUCT-----------------*/
exports.updateOne = (req, res) => {
    let sql =  `SELECT * FROM products 
                WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id], type:sequelize.QueryTypes.SELECT
    }).then(product => {
        if (product.length === 0) {
            res.status(404).send("Producto no existente");
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
                let sql =  `UPDATE products 
                SET product_name = :product_name, abbreviation = :abbreviation, link_img = :link_img, price = :price
                WHERE product_id = :product_id `;
                sequelize.query( sql, {
                    replacements: changed_product
                }).then(update_result => {
                    res.json(changed_product);
                }).catch((err)=>{
                    res.status(500).send( 'Error: ' + err );
                })
            }

            if (req.body.product_name !== undefined || req.body.abbreviation !== undefined ) {
                let sql =  `SELECT * FROM products 
                            WHERE  (product_name = ? OR abbreviation = ?)
                                    AND  product_id != ?`;
                sequelize.query( sql, {
                    replacements: [req.body.product_name, req.body.abbreviation, req.params.id], type:sequelize.QueryTypes.SELECT
                }).then(repeated_product => {
                    if (repeated_product.length === 0){
                        updateProduct ();
                    } else {
                                        //error handling when there is/are repeated product_name and/or abbreviation
                        let product_name = 0;
                        let abbreviation = 0;
                        //checking what is repeated
                        repeated_product.forEach(oneProduct => {
                            if (oneProduct.abbreviation === req.body.abbreviation && oneProduct.product_name === req.body.product_name) {
                                abbreviation++;
                                product_name++;
                            } else if (oneProduct.product_name === req.body.product_name) {
                                product_name++;
                            } else if (oneProduct.abbreviation === req.body.abbreviation) {
                                abbreviation++;
                            } 
                        });
                        //sending error message
                        if (abbreviation > 0 && product_name > 0) {
                            res.status(400).send(`Error: ya existe un producto con este product_name y abbreviation`);
                        } else if (product_name > 0) {
                            res.status(400).send(`Error: ya existe un producto con este product_name`);
                        } else if (abbreviation > 0) {
                            res.status(400).send(`Error: ya existe un producto con este abbreviation`);
                        } else {
                            res.status(400).send(`Error: ya existe un producto con este product_name o abbreviation`);
                        }
                    }
                }).catch((err)=>{
                    res.status(500).send( 'Error: ' + err );
                })
            } else {
                updateProduct ();
            }
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}

/*-----------------DELETE A PRODUCT-----------------*/
exports.deleteOne = (req,res) => {
    let sql =  `DELETE FROM products 
                WHERE product_id = ?`;
    sequelize.query( sql, {
        replacements: [req.params.id]
    }).then(product => {
        if (product[0].affectedRows === 0) {
            res.status(404).send("Error: Producto no existente");
        } else {
            res.json(`Eliminado con éxito producto con id: ${req.params.id}`);
        }
    }).catch((err)=>{
        res.status(500).send( 'Error: ' + err );
    })
}