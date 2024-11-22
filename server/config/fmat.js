const sql = require("mssql");

module.exports = (app, pool, sql, config) => {

    // Route to fetch all fmat data
    app.get("/api/fmat", async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request().query("SELECT * FROM [RawMaterialsDB].[dbo].[fmat]");
            res.json(result.recordset);
        } catch (err) {
            console.error("Error fetching fmat data:", err);
            res.status(500).json({ error: "Failed to fetch fmat data" });
        }
    });

    // Route to fetch a single fmat entry by fmatid
    app.get("/api/fmat/:fmatid", async (req, res) => {
        const { fmatid } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input("fmatid", sql.Int, fmatid) // fmatid is an integer
                .query("SELECT * FROM [RawMaterialsDB].[dbo].[fmat] WHERE fmatid = @fmatid");

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: "FMAT entry not found" });
            }

            res.json(result.recordset[0]);
        } catch (err) {
            console.error("Error fetching fmat data:", err);
            res.status(500).json({ error: "Failed to fetch fmat data" });
        }
    });

    // Route to update an entry in the fmat table
    app.post("/api/fmat/edit/:fmatid", async (req, res) => {
        try {
            const { fmatid } = req.params;
            const { sample_code, Code, percentage, active_ingredient } = req.body;

            const request = pool.request();
            request.input("fmatid", sql.Int, fmatid); // fmatid is an integer

            let updateQuery = "UPDATE [RawMaterialsDB].[dbo].[fmat] SET ";
            const queryParams = [];

            // Function to handle empty or null values by assigning them NULL in the database
            const handleNull = (value) => (value === "" || value === null ? null : value);

            // Add parameters to the query, and assign `NULL` if field is empty or null
            if (sample_code !== undefined) {
                updateQuery += "sample_code=@sample_code, ";
                queryParams.push({ name: "sample_code", value: handleNull(sample_code) });
            }
            if (Code !== undefined) {
                updateQuery += "Code=@Code, ";
                queryParams.push({ name: "Code", value: handleNull(Code) });
            }
            if (percentage !== undefined) {
                updateQuery += "percentage=@percentage, ";
                queryParams.push({ name: "percentage", value: handleNull(percentage) });
            }
            if (active_ingredient !== undefined) {
                updateQuery += "active_ingredient=@active_ingredient, ";
                queryParams.push({ name: "active_ingredient", value: handleNull(active_ingredient) });
            }

            // Remove the trailing comma and space from the query string
            updateQuery = updateQuery.slice(0, -2);

            // Add the WHERE clause
            updateQuery += " WHERE fmatid=@fmatid";

            // Add parameters to the request
            queryParams.forEach(param => {
                request.input(param.name, sql.NVarChar, param.value);
            });

            // Execute the query
            await request.query(updateQuery);

            res.json({ success: "FMAT entry updated successfully" });

        } catch (err) {
            console.error("Error updating data:", err.message);
            res.status(500).json({ error: "Failed to update data" });
        }
    });

    // Route to add a new fmat entry
    app.post("/api/fmat", async (req, res) => {
        const { sample_code, Code, percentage, active_ingredient } = req.body;
    
        try {
            const pool = await sql.connect(config);
            await pool.request()
                .input("sample_code", sql.NChar(11), sample_code)
                .input("Code", sql.NVarChar(50), Code)
                .input("percentage", sql.VarChar(50), percentage)
                .input("active_ingredient", sql.VarChar(3), active_ingredient)
                .query(`
                    INSERT INTO FMAT (sample_code, Code, percentage, active_ingredient)
                    VALUES (@sample_code, @Code, @percentage, @active_ingredient)
                `);
            res.status(200).send("FMAT entry created successfully!");
        } catch (err) {
            console.error("Error inserting FMAT data:", err);
            res.status(500).send("Failed to insert FMAT data.");
        }
    });

    // Route to delete a fmat entry by fmatid
    app.delete("/api/fmat/:fmatid", async (req, res) => {
        const { fmatid } = req.params;

        try {
            const pool = await sql.connect(config);
            const request = pool.request();

            request.input("fmatid", sql.Int, fmatid); // fmatid is an integer

            await request.query("DELETE FROM [RawMaterialsDB].[dbo].[fmat] WHERE fmatid = @fmatid");

            res.status(200).json({ success: "FMAT entry deleted successfully" });
        } catch (err) {
            console.error("Error deleting fmat data:", err);
            res.status(500).json({ error: "Failed to delete fmat data" });
        }
    });
};
