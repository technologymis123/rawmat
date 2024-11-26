const sql = require("mssql");

module.exports = (app, pool, sql, config) => {

    // Route to fetch all users
    app.get("/api/users", async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request().query("SELECT * FROM [RawMaterialsDB].[dbo].[Users]");
            res.json(result.recordset);
        } catch (err) {
            console.error("Error fetching users:", err);
            res.status(500).json({ error: "Failed to fetch users" });
        }
    });

    // Route to fetch a single user by name
    app.get("/api/users/:name", async (req, res) => {
        const { name } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input("name", sql.VarChar(50), name) // name is a varchar(50)
                .query("SELECT * FROM [RawMaterialsDB].[dbo].[Users] WHERE name = @name");

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json(result.recordset[0]);
        } catch (err) {
            console.error("Error fetching user data:", err);
            res.status(500).json({ error: "Failed to fetch user data" });
        }
    });

    // Route to update a user's details
    app.post("/api/users/edit/:name", async (req, res) => {
        try {
            const { name } = req.params;
            const { password, role } = req.body;

            const request = pool.request();
            request.input("name", sql.VarChar(50), name); // name is a varchar(50)

            let updateQuery = "UPDATE [RawMaterialsDB].[dbo].[Users] SET ";
            const queryParams = [];

            // Function to handle empty or null values by assigning them NULL in the database
            const handleNull = (value) => (value === "" || value === null ? null : value);

            // Add parameters to the query
            if (password !== undefined) {
                updateQuery += "password=@password, ";
                queryParams.push({ name: "password", value: handleNull(password) });
            }
            if (role !== undefined) {
                updateQuery += "role=@role, ";
                queryParams.push({ name: "role", value: handleNull(role) });
            }

            // Remove the trailing comma and space from the query string
            updateQuery = updateQuery.slice(0, -2);

            // Add the WHERE clause
            updateQuery += " WHERE name=@name";

            // Add parameters to the request
            queryParams.forEach(param => {
                request.input(param.name, sql.VarChar, param.value);
            });

            // Execute the query
            await request.query(updateQuery);

            res.json({ success: "User updated successfully" });

        } catch (err) {
            console.error("Error updating user data:", err.message);
            res.status(500).json({ error: "Failed to update user data" });
        }
    });
    
    // Route to delete a user by name
    app.delete("/api/users/:name", async (req, res) => {
        const { name } = req.params;

        try {
            const pool = await sql.connect(config);
            const request = pool.request();

            request.input("name", sql.VarChar(50), name); // name is a varchar(50)

            await request.query("DELETE FROM [RawMaterialsDB].[dbo].[Users] WHERE name = @name");

            res.status(200).json({ success: "User deleted successfully" });
        } catch (err) {
            console.error("Error deleting user data:", err);
            res.status(500).json({ error: "Failed to delete user data" });
        }
    });
};
