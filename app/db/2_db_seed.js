/*---------------------------------------------REQUIREMENTS--------------------------------------------*/
const db_data     = require('../config/db_connection_data');

const sequelize = require('../config/db_config');

/*---------------------------------------------CREATE ADMINS USERS--------------------------------------------*/
let dbsql = [ 
    `INSERT INTO ${db_data.conf_db_name}.users (user_id, username, firstname, lastname, email, address, phone, password, last_order, is_admin) VALUES
        (3, 'JonnieBins', 'Jonas', 'Bins', 'jonbins@zoie.me', '3656 Watsica Forest', 1518432774, '$2b$10$kFViDKSpDnijo3icqvMIHuBIeyxe5V0kA1vWWvKEYxaaHDoKpy1nG', 12, 0),
        (4, 'Carmelo', 'Marcelino', 'McKenzie', 'marcemc@lonnie.biz', '02362 Uriah Burgs', 1399367233, '$2b$10$BjWt4G5/Uzf.PoIWYcMjU.4GtltIqx4Ce5iSOuuvZCjGx9X3o9oKW', 9, 0),
        (5, 'DaniH', 'Daniela', 'Hyatt', 'dani@ethelyn.tv', '05305 Hoeger Orchard', 2147483647, '$2b$10$wBC7KnYDeweEibF1fNSogeoaYPu4SYnwvxjK6p1j.YaJOmyT.IOw.', 13, 0),
        (6, 'TriishhK', 'Trisha', 'Kling', 'triish@rubie.me', '415 Jerome Lock', 2147483647, '$2b$10$yFBtfSXXnONdWO2u47fYGe6MlJNuePZvV82Lpo2cVk9EWfUzkbbR2', 15, 0),
        (7, 'Anika', 'Anika', 'Zemlak', 'anikazemlak@jarrell.info', '5721 Tavares Avenue', 2147483647, '$2b$10$nsokCmGigSFaRxhQOtV6ouaLnx.1NWQcc/I/jEfEn930lo3bPuGYa', 5, 0),
        (8, 'KaylahB', 'Kaylah', 'Braun', 'kaykay@college,edu', '33304 Rogers Streets', 2147483647, '$2b$10$zQ7OAPguIk6UIUvzJZSlKeF6r525q9a6zOmIQW8oYHGThL1p4QkZ2', 0, 0),
        (9, 'Ethelina', 'Ethel', 'Roob', 'roobethel@fakemail.com', '998 Walker Corner', 2147483647, '$2b$10$a9zJaqwvTHdq1ZmXBeJYHuI6TEsdxq1kXN94.yMO20Ysfy6KQpafS', 0, 0),
        (10, 'JayKing', 'Jayden', 'Kuhn', 'jayjay@elavionc.ito', '423 Consuelo Garden', 2147483647, '$2b$10$bBi2wKNkP6omaRS.7nFuT.81NLyDNCGATuYZXLWi5m8BP67hZewMG', 0, 0),
        (11, 'Braz', 'Braxton', 'Lavina', 'blavina@mail.me', '3782 Kirlin Unions', 2147483647, '$2b$10$lgQPwq2m6KlLnQVIJuRWDeHtSGbp9vMvhnRYrk5YbsHjXaNbca.de', 4, 0),
        (12, 'TobyPadberg', 'Toby', 'Padberg', 'tpadber@fakest.org', '11558 Easter Ways', 1518875408, '$2b$10$7cJuetJ8vSmS/64vO.lyVOJSiiGkfzkfH/TUiTjbUfspieaBzg6te', 0, 0),
        (13, 'Keirara', 'Keira', 'Ruecker', 'keirrue@company.com', '5093 Wiegand Rapids', 2147483647, '$2b$10$5XjY04UoxhmYtIq1WI7HrO/saOYIi2TI570V4aGzWd8ule/IdCe5.', 11, 0),
        (14, 'KylaHintz', 'Kyla', 'Hintz', 'kyla_hintz@lexus.ca', '64778 Brett Spring', 2147483647, '$2b$10$QOonD6MTTq/vSW1fS39BZ.P.d6YsIGB1e0li8k0boUOlExTeWOSu6', 0, 0),
        (15, 'Amayita', 'Amaya', 'Nakia', 'Nakiaa@company,com', '78315 Stoltenberg Orchard', 2147483647, '$2b$10$wWWSiqzQwUC902vB.thcZ.gqUh59YyN2fqiOHdRY1jY5L576ycPfm', 3, 0),
        (16, 'PaoGrimes', 'Paolo', 'Grimes', 'paolog@carmine.co.uk', '9580 Serenity Green', 2147483647, '$2b$10$BHKRopreF4KTrIFoD3PSj.JzTmClN79vVqio.AMdgzWYOWwWh6Bdq', 0, 0),
        (17, 'ElliSanford', 'Ellis', 'Sanford', 'ellissandford@college.com', '08337 Greenfelder Summit', 2147483647, '$2b$10$2vnDrwBAPOIlOLcWo70ZoOwo8xD3kLkfrxHA1EhpGqHtA73kALw0u', 0, 0),
        (18, 'Fadel', 'Oleta', 'Fadel', 'oletfadel@college.com', '955 Nikolas Forest', 1670218545, '$2b$10$i.XpKzBFDKuoQIebQsuAkOetT1p15XGJUF7udss6BpiCRvLWslLOK', 0, 0),
        (19, 'JoeyRie', 'Joey', 'McLaughlin', 'mclaughlin@mail.ar', '44786 Trent Cliff', 1431879482, '$2b$10$8.pNMIhkz4T/9GmXKfhJMeTdEDJt78BLOnAz6Onij.llM6gdfZqUa', 0, 0),
        (20, 'EthanF', 'Ethan', 'Ford', 'ethan@kattie.ca', '268 Deanna Stream', 2147483647, '$2b$10$hOEzIkTQ2G3TWzCYN0TTR.OwyN5J422q/T6bdFJPELCh0XAuFqBx6', 0, 0),
        (21, 'WesEast', 'Westley', 'Clifford', 'thewest@college.ar', '0206 Trevor Spurs', 2147483647, '$2b$10$liNe7tA871aNmQiR7t6FUOcVZuWWzefP/l1yTHJZe44WLEwSXkEGy', 6, 0),
        (22, 'Margarita', 'Margret', 'Stracke', 'margiestracke@mail.me', '28250 Ritchie Lane', 1616177886, '$2b$10$Y0yF4vXNrdBjYUfKboUO0eprKdGeEvV5okfw3uWZrgS.mE6shN91O', 0, 0),
        (23, 'DarrWhite', 'Darrell', 'White', 'notfromtheoffice@mail.com', '746 Gibson Road', 1608614033, '$2b$10$Ybu7Ry901fisNSaUm79FyuLIIt6i8MOT/6NnmM4VtCeBIZ8O4s4Ee', 0, 0),
        (24, 'GilPrice', 'Gilberto', 'Price', 'gilprice@health.edu', '0461 Keegan Cape', 1526287604, '$2b$10$GBcQjNwuoz0RiKZdM6HmiOzRICQIbgCCqYu1Wfc1d08VETUys3stq', 7, 0),
        (25, 'RiceChelsey', 'Chelsey', 'Rice', 'chelset_rice@college.com', '292 Ron Lock', 1896270724, '$2b$10$KwiTK4KebxcORDQVk.cZf.zQvfzl2wtr.vLppMu283Tp3esUYlGOC', 0, 0),
        (26, 'NickieNick', 'Nicholas', 'Huel', 'nickhuel@anothermail.edu', '733 Vandervort Meadows', 2147483647, '$2b$10$Fz9yIsyETwCS36KhcQFbTuvhzGsbvIrYIAkj1uErJ/xuWU6F57aPa', 10, 0),
        (27, 'Estelle', 'Estelle', 'Wisoky', 'wisoky@company.org', '115 Elissa Lodge', 2147483647, '$2b$10$j7IvBqFrujcURpjI2p1TQOEyRXfxhhGcvjWxHJAwze6YYVqMSpFey', 8, 0),
        (28, 'JediMaster', 'Luke', 'Skywalker', 'lukeskywalker@jedi.sw', '526 Tatooine', 1545879563, '$2b$10$t5n2/8XzmBGvryK2Mi8.j.VBJVCaqaNQzZDoZd4ifRDg.KUDAx/0q', 14, 0);`,
    `ALTER TABLE ${db_data.conf_db_name}.users
        MODIFY user_id int(64) AUTO_INCREMENT NOT NULL, AUTO_INCREMENT=29;`,

    `INSERT INTO ${db_data.conf_db_name}.products (product_id, product_name, abbreviation, link_img, price) VALUES
        (1, 'Hamburguesa Veggie', 'HamVegg', 'https://images.unsplash.com/photo-1540265556701-ae209ac395cd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', 300),
        (2, 'Hamburguesa Doble', 'HamDob', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 370),
        (3, 'Hamburguesa Clásica', 'HamClas', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 310),
        (4, 'Hamburguesa con Hongos', 'HamHon', 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 330),
        (5, 'Hamburguesa de Pollo', 'HamPol', 'https://images.unsplash.com/photo-1566217688581-b2191944c2f9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 340),
        (6, 'Hamburguesa con Bacon', 'HamBac', 'https://images.unsplash.com/photo-1565060050382-f180053db6fa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 400),
        (7, 'Papas Fritas', 'Fritas', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 95),
        (8, 'Sandwich Veggie', 'SandVegg', 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 200),
        (9, 'Sandwich de Carne', 'SandCarn', 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 250),
        (10, 'Sandwich de Atún', 'SandAtu', 'https://images.unsplash.com/photo-1558985250-27a406d64cb3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 220),
        (11, 'Sandwich de Jamón', 'SandJam', 'https://images.unsplash.com/photo-1520174691701-bc555a3404ca?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', 230),
        (12, 'Sandwich Tostado de Queso', 'SandQue', 'https://images.unsplash.com/photo-1475090169767-40ed8d18f67d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 200),
        (13, 'Bagel de Salmón', 'BagSalm', 'https://images.unsplash.com/photo-1572137162111-fc6e04414e21?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 150),
        (14, 'Bagel con Queso crema', 'BagQue', 'https://images.unsplash.com/photo-1572982270458-ad80e5fcc49a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 120),
        (15, 'Bagel con Pollo', 'BagPol', 'https://images.unsplash.com/photo-1554474217-1c86a5163807?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 120),
        (16, 'Tostada de Palta Veggie', 'TostPal', 'https://images.unsplash.com/photo-1551266519-b6713933ebd6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 115),
        (17, 'Tostada con Palta y Huevo', 'TostHue', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 125),
        (18, 'Ensalada Veggie', 'EnsVegg', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 220),
        (19, 'Ensalada Cesar', 'EnsCes', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 270),
        (20, 'Ensalada Verde', 'EnsVerd', 'https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 220),
        (21, 'Ensalada de Camarones', 'EnsCam', 'https://images.unsplash.com/photo-1551248429-40975aa4de74?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 300),
        (22, 'Ensalada de Pasta y Pesto', 'EnsPast', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 280),
        (23, 'Taco de Carne', 'TacCarn', 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 230),
        (24, 'Taco de Pollo', 'TacPol', 'https://images.unsplash.com/photo-1568106690101-fd6822e876f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 200),
        (25, 'Taco Veggie', 'TacVegg', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 180),
        (26, 'Taco de Carne Picante', 'TacPic', 'https://images.unsplash.com/photo-1574782091246-c65ed4510300?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 220),
        (27, 'Nachos con Carne', 'NacCarn', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 175),
        (28, 'Nachos con Salsas Veggie', 'NacVeg', 'https://images.unsplash.com/photo-1523634700860-90d0ef74f137?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 160),
        (29, 'Lemon Pie (Porción)', 'PieLem', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 90),
        (30, 'Tarta de Arándanos (Porción)', 'PieAran', 'https://images.unsplash.com/photo-1476887334197-56adbf254e1a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 90),
        (31, 'Tarta de Peras (Porción)', 'PiePer', 'https://images.unsplash.com/photo-1562007908-72e11e85b1cd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 115),
        (32, 'Cheesecake con Salsa de Caramelo (Porción)', 'CheeCar', 'https://images.unsplash.com/photo-1547414368-ac947d00b91d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 100),
        (33, 'Cheesecake de Arándanos (Porción)', 'CheeAran', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 110),
        (34, 'Cheesecake de Chocolate (Porción)', 'CheeChoc', 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 100),
        (35, 'Cheesecake de Mango (Porción)', 'CheeMang', 'https://images.unsplash.com/photo-1570781148825-b9c37b9531e7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 130),
        (36, 'Cerveza (500ml)', 'CervLat', 'https://images.unsplash.com/photo-1580805375657-ea29c6624dd9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 90),
        (37, 'Cerveza (1l)', 'CervBot', 'https://images.unsplash.com/photo-1499424474736-c040d0665d84?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 140),
        (38, 'Soju (600ml)', 'SojuBot', 'https://images.unsplash.com/photo-1528615141309-53f2564d3be8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 210),
        (39, 'Bebida de Maracuyá (500ml)', 'BebMar', 'https://images.unsplash.com/photo-1548158518-c2f131b1aa01?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 110),
        (40, 'Limonada (600ml)', 'BebLim', 'https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 90),
        (41, 'Pomelada (600ml)', 'BebPom', 'https://images.unsplash.com/photo-1500631195312-e3a9a5819f92?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 90),
        (42, 'Pepsi (330ml)', 'PepsiLat', 'https://images.unsplash.com/photo-1546695259-ad30ff3fd643?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 50),
        (43, 'Pepsi (500ml)', 'PepsiBot', 'https://images.unsplash.com/photo-1558456210-a51b371a4b63?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 80),
        (44, 'Coca-Cola (330ml)', 'CocaLat', 'https://images.unsplash.com/photo-1571814582435-672b9e1df15d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 50),
        (45, 'Coca-Cola (500ml)', 'CocaBot', 'https://images.unsplash.com/flagged/photo-1567861248188-7f920f024c8c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', 80),
        (46, 'Agua mineral', 'Agua', 'https://images.unsplash.com/photo-1546498159-9a2fac87e770?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', 60);`,
    `ALTER TABLE ${db_data.conf_db_name}.products
        MODIFY product_id int(64) AUTO_INCREMENT NOT NULL, AUTO_INCREMENT=47;`,
    
    
    `INSERT INTO ${db_data.conf_db_name}.orders (order_id, description, payment, order_state, time, total_price, user_id) VALUES
        (1, '1xHamVegg 1xAgua', 'debito', 'entregado', '2020-03-18 12:30:22.154', 360, 5),
        (2, '1xTacCarn', 'efectivo', 'entregado', '2020-03-18 12:45:32.524', 230, 4),
        (3, '3xHamDob 2xCervLat 1xAgua', 'credito', 'cancelado', '2020-03-18 13:20:18.556', 1350, 15),
        (4, '2xTacPol 2xBebLim', 'debito', 'entregado', '2020-03-18 13:26:15.125', 580, 11),
        (5, '1xHamHon', 'efectivo', 'entregado', '2020-03-18 14:52:16.254', 330, 7),
        (6, '1xSandVegg 1xEnsCam 2xCheeChoc 1xCervBot', 'debito', 'entregado', '2020-03-18 14:56:55.412', 840, 21),
        (7, '1xEnsPast', 'efectivo', 'entregado', '2020-03-18 15:02:55.456', 280, 24),
        (8, '1xTacPic', 'efectivo', 'entregado', '2020-03-18 15:33:06.332', 220, 27),
        (9, '2xHamDob 1xHamVegg 2xNacVeg 6xCervLat', 'credito', 'entregado', '2020-03-18 21:16:52.456', 1900, 4),
        (10, '1xBagQue 1xTostHue 1xCheeAran 1xPieAran 2xBebMar', 'efectivo', 'entregado', '2020-03-18 21:22:16.465', 665, 26),
        (11, '1xPiePer 1xCheeMang 2xBebPom', 'debito', 'enviando', '2020-03-18 21:33:59.725', 425, 13),
        (12, '2xSandJam 2xCocaLat', 'debito', 'preparando', '2020-03-18 21:45:02.825', 560, 3),
        (13, '1xBagSalm', 'efectivo', 'confirmado', '2020-03-18 21:59:32.365', 150, 5),
        (14, '2xHamHon 2xHamBac 4xFritas 8xCervLat', 'credito', 'confirmado', '2020-03-18 22:03:06.754', 2560, 28),
        (15, '2xTostPal', 'efectivo', 'nuevo', '2020-03-18 22:06:47.982', 230, 6);`,
    `ALTER TABLE ${db_data.conf_db_name}.orders
        MODIFY order_id int(64) AUTO_INCREMENT NOT NULL, AUTO_INCREMENT=16;`,

    `INSERT INTO ${db_data.conf_db_name}.products_orders (order_id, product_id, product_quantity, user_id) VALUES
        (1, 1, 1, 5),
        (1, 46, 1, 5),
        (2, 23, 1, 4),
        (3, 2, 3, 15),
        (3, 36, 2, 15),
        (3, 46, 1, 15),
        (4, 24, 2, 11),
        (4, 40, 2, 11),
        (5, 4, 1, 7),
        (6, 8, 1, 21),
        (6, 21, 1, 21),
        (6, 34, 2, 21),
        (6, 37, 1, 21),
        (7, 22, 1, 24),
        (8, 26, 1, 27),
        (9, 2, 2, 4),
        (9, 1, 1, 4),
        (9, 28, 2, 4),
        (9, 36, 6, 4),
        (10, 14, 1, 26),
        (10, 17, 1, 26),
        (10, 33, 1, 26),
        (10, 30, 1, 26),
        (10, 39, 2, 26),
        (11, 31, 1, 13),
        (11, 35, 1, 13),
        (11, 41, 2, 13),
        (12, 11, 2, 3),
        (12, 44, 2, 3),
        (13, 13, 1, 5),
        (14, 4, 2, 28),
        (14, 6, 2, 28),
        (14, 7, 4, 28),
        (14, 36, 8, 28),
        (15, 16, 2, 6);`
].join(' ');

sequelize.query( dbsql, {
    }).then(result => {
        console.log('Seed data successfully added')
    }).catch((err)=>{
        console.log( 'Error: ' + err );
})
