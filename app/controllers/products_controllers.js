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
        console.log(err);
        res.status(500);
        res.render('error', { error: err });
    })
}

exports.findAll = (req,res) => {
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
}

exports.findOne = (req, res) => {
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
}

exports.updateOne = (req, res) => {
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
}