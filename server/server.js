const express = require("express");
const cors = require("cors");
const path = require("path");
const sql = require("mssql");
const rawmatRoutes = require("./config/rawmat");
const formRoutes = require("./config/form");
const fmatRoutes = require("./config/fmat");
const loginRoutes = require("./config/login");
const usersRoutes = require("./config/users");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const port = 5000;

// SQL Server configuration
const config = {
    server: 'SR-TECH-JOSEPH',
    database: 'RawMaterialsDB',
    options: {
        encrypt: false,
        port: 1433,
    },
    authentication: {
        type: 'default',
        options: {
            userName: 'myuser',
            password: 'myuser'
        }
    }
};

// Connect to SQL Server and set up routes
sql.connect(config).then(pool => {
    if (pool.connected) {
        console.log("Connected to SQL Server");
        
        loginRoutes(app,pool,sql);

        usersRoutes(app,pool,sql,config);
        // Pass the pool to the CRUD modules
        rawmatRoutes(app, pool, sql, config);
        formRoutes(app, pool, sql, config);
        fmatRoutes(app, pool, sql, config);
    }

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error("Database connection failed:", err);
});
