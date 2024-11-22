module.exports = (app, pool, sql) => {
    // Route to handle user login
    app.post("/login", async (req, res) => {
        const { name, password } = req.body; // Use 'name' instead of 'email'

        try {
            const userResult = await pool
                .request()
                .input("name", sql.VarChar, name)
                .query("SELECT * FROM Users WHERE name = @name"); // Search by 'name'

            if (userResult.recordset.length > 0) {
                const user = userResult.recordset[0];
                if (user.password === password) {
                    res.json({ status: "Success", role: user.role });
                } else {
                    res.json("Wrong password");
                }
            } else {
                res.json("No records found!");
            }
        } catch (err) {
            console.error("Error during login:", err);
            res.status(500).send("Server error");
        }
    });

    // Route to handle user registration
    app.post("/register", async (req, res) => {
        const { name, password } = req.body; // Remove 'email'
        const defaultRole = "user"; // Default role

        try {
            // Check if user already exists
            const userResult = await pool
                .request()
                .input("name", sql.VarChar, name)
                .query("SELECT * FROM Users WHERE name = @name"); // Search by 'name'

            if (userResult.recordset.length > 0) {
                res.json("Already registered");
            } else {
                // Insert the new user with a role
                await pool
                    .request()
                    .input("name", sql.VarChar, name)
                    .input("password", sql.VarChar, password)
                    .input("role", sql.VarChar, defaultRole) // Provide a default role
                    .query("INSERT INTO Users (name, password, role) VALUES (@name, @password, @role)");
                res.json("User registered successfully");
            }
        } catch (err) {
            console.error("Error during registration:", err);
            res.status(500).json("Error registering user");
        }
    });
};
