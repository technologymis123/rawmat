const sql = require("mssql");

module.exports = (app, pool, sql, config) => {
    // Route to fetch form data with sample_code and item
    app.get("/api/form", async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request().query("SELECT sample_code, item FROM [RawMaterialsDB].[dbo].[form]");  // Replace with actual table name
            res.json(result.recordset);
        } catch (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Failed to fetch form data" });
        }
    });

    // Route to fetch a single form entry by sample_code
    app.get("/api/form/:sample_code", async (req, res) => {
        const { sample_code } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input("sample_code", sql.VarChar, sample_code)
                .query("SELECT * FROM [RawMaterialsDB].[dbo].[form] WHERE sample_code = @sample_code");  // Replace with actual table name
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ error: "Form not found" });
            }

            res.json(result.recordset[0]);
        } catch (err) {
            console.error("Error fetching form data:", err);
            res.status(500).json({ error: "Failed to fetch form data" });
        }
    });

    // Route to update an entry in the Form table
    app.post("/api/form/edit/:sample_code", async (req, res) => {
        try {
            const { sample_code } = req.params;
            const {
                product_code, item, file_name, customer, marketer, pic1, pic2, form_no, date, appearance,
                colour, ph, viscosity, odour, packaging, remarks, density, prepared_by, approved_by
            } = req.body;
    
            const request = pool.request();
            request.input("sample_code", sql.NChar, sample_code);
    
            let updateQuery = "UPDATE [RawMaterialsDB].[dbo].[form] SET ";
            const queryParams = [];
    
            // Function to handle empty or null values by assigning them NULL in the database
            const handleNull = (value) => (value === "" || value === null ? null : value);
    
            // Add parameters to the query and assign NULL if the field is empty or null
            if (product_code !== undefined) {
                updateQuery += "product_code=@product_code, ";
                queryParams.push({ name: "product_code", value: handleNull(product_code) });
            }
            if (item !== undefined) {
                updateQuery += "item=@item, ";
                queryParams.push({ name: "item", value: handleNull(item) });
            }
            if (file_name !== undefined) {
                updateQuery += "file_name=@file_name, ";
                queryParams.push({ name: "file_name", value: handleNull(file_name) });
            }
            if (customer !== undefined) {
                updateQuery += "customer=@customer, ";
                queryParams.push({ name: "customer", value: handleNull(customer) });
            }
            if (marketer !== undefined) {
                updateQuery += "marketer=@marketer, ";
                queryParams.push({ name: "marketer", value: handleNull(marketer) });
            }
            if (pic1 !== undefined) {
                updateQuery += "pic1=@pic1, ";
                queryParams.push({ name: "pic1", value: handleNull(pic1) });
            }
            if (pic2 !== undefined) {
                updateQuery += "pic2=@pic2, ";
                queryParams.push({ name: "pic2", value: handleNull(pic2) });
            }
            if (form_no !== undefined) {
                updateQuery += "form_no=@form_no, ";
                queryParams.push({ name: "form_no", value: handleNull(form_no) });
            }
            if (date !== undefined) {
                updateQuery += "date=@date, ";
                queryParams.push({ name: "date", value: handleNull(date) });
            }
            if (appearance !== undefined) {
                updateQuery += "appearance=@appearance, ";
                queryParams.push({ name: "appearance", value: handleNull(appearance) });
            }
            if (colour !== undefined) {
                updateQuery += "colour=@colour, ";
                queryParams.push({ name: "colour", value: handleNull(colour) });
            }
            if (ph !== undefined) {
                updateQuery += "ph=@ph, ";
                queryParams.push({ name: "ph", value: handleNull(parseFloat(ph)) });
            }
            if (viscosity !== undefined) {
                updateQuery += "viscosity=@viscosity, ";
                queryParams.push({ name: "viscosity", value: handleNull(parseFloat(viscosity)) });
            }
            if (odour !== undefined) {
                updateQuery += "odour=@odour, ";
                queryParams.push({ name: "odour", value: handleNull(odour) });
            }
            if (packaging !== undefined) {
                updateQuery += "packaging=@packaging, ";
                queryParams.push({ name: "packaging", value: handleNull(packaging) });
            }
            if (remarks !== undefined) {
                updateQuery += "remarks=@remarks, ";
                queryParams.push({ name: "remarks", value: handleNull(remarks) });
            }
            if (density !== undefined) {
                updateQuery += "density=@density, ";
                queryParams.push({ name: "density", value: handleNull(density) });
            }
            if (prepared_by !== undefined) {
                updateQuery += "prepared_by=@prepared_by, ";
                queryParams.push({ name: "prepared_by", value: handleNull(prepared_by) });
            }
            if (approved_by !== undefined) {
                updateQuery += "approved_by=@approved_by, ";
                queryParams.push({ name: "approved_by", value: handleNull(approved_by) });
            }
    
            // Remove the trailing comma and space from the query string
            updateQuery = updateQuery.slice(0, -2);
    
            // Add the WHERE clause
            updateQuery += " WHERE sample_code=@sample_code";
    
            // Add parameters to the request
            queryParams.forEach(param => {
                request.input(param.name, sql.NVarChar, param.value);
            });
    
            // Execute the query
            await request.query(updateQuery);
    
            res.json({ success: "Form entry updated successfully" });
    
        } catch (err) {
            console.error("Error updating data:", err.message);
            res.status(500).json({ error: "Failed to update data" });
        }
    });
    
    // Route to add a new form entry
    app.post("/api/form", async (req, res) => {
        try {
            const {
                sample_code, product_code, item, file_name, customer, marketer, pic1, pic2, 
                form_no, date, appearance, colour, ph, viscosity, packaging, remarks, 
                density, prepared_by, approved_by
            } = req.body;

            const pool = await sql.connect(config);
            const request = pool.request();

            // Bind input parameters with the correct SQL data types
            request.input("sample_code", sql.NChar(11), sample_code);
            request.input("product_code", sql.NChar(11), product_code || null);
            request.input("item", sql.VarChar(50), item || null);
            request.input("file_name", sql.VarChar(50), file_name || null);
            request.input("customer", sql.VarChar(50), customer || null);
            request.input("marketer", sql.VarChar(50), marketer || null);
            request.input("pic1", sql.VarChar(50), pic1 || null);
            request.input("pic2", sql.VarChar(50), pic2 || null);
            request.input("form_no", sql.NChar(6), form_no || null);
            request.input("date", sql.NVarChar(50), date || null);
            request.input("appearance", sql.VarChar(50), appearance || null);
            request.input("colour", sql.VarChar(50), colour || null);
            request.input("ph", sql.VarChar(50), ph || null);
            request.input("viscosity", sql.VarChar(50), viscosity || null);
            request.input("packaging", sql.VarChar(50), packaging || null);
            request.input("remarks", sql.VarChar(100), remarks || null);
            request.input("density", sql.VarChar(100), density || null); // Assuming density is a string; adjust if needed
            request.input("prepared_by", sql.VarChar(50), prepared_by || null);
            request.input("approved_by", sql.VarChar(50), approved_by || null);

            // Construct the INSERT query
            await request.query(`
                INSERT INTO [RawMaterialsDB].[dbo].[form] 
                (sample_code, product_code, item, file_name, customer, marketer, pic1, pic2, 
                form_no, date, appearance, colour, ph, viscosity, packaging, remarks, 
                density, prepared_by, approved_by)
                VALUES 
                (@sample_code, @product_code, @item, @file_name, @customer, @marketer, 
                @pic1, @pic2, @form_no, @date, @appearance, @colour, @ph, @viscosity, 
                @packaging, @remarks, @density, @prepared_by, @approved_by)
            `);

            res.status(201).json({ success: "Form entry added successfully" });
        } catch (err) {
            console.error("Error inserting form data:", err);
            res.status(500).json({ error: "Failed to insert form data" });
        }
    });


    // Route to delete a form entry by sample_code
    app.delete("/api/form/:sample_code", async (req, res) => {
        const { sample_code } = req.params;

        try {
            const pool = await sql.connect(config);
            const request = pool.request();

            request.input("sample_code", sql.VarChar, sample_code);

            await request.query("DELETE FROM [RawMaterialsDB].[dbo].[form] WHERE sample_code = @sample_code");

            res.status(200).json({ success: "Form entry deleted successfully" });
        } catch (err) {
            console.error("Error deleting form data:", err);
            res.status(500).json({ error: "Failed to delete form data" });
        }
    });
};