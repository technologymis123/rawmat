const sql = require("mssql");

module.exports = (app, pool, sql, config) => {

    // Route to add a new entry to the RawMat table
    app.post("/api/rawmat", async (req, res) => {
        try {
            const {
                Code, Description, INCI, ISO_16128_Natural_Origin_Content,
                Batch_Lot_No, Expiry_date, Key_In_Date, Appearance, Country_Of_Origin,
                Source_Of_Origin, Dossage, Write_up, Preservative, Remark, Awards,
                Comedogenic_Rating, Online_Feedback, Category, Upcycle, Sustainability,
                Cruelty_Free, Vegan_friendly
            } = req.body;

            const pool = await sql.connect(config);
            const request = pool.request();

            request.input("Code", Code || null);
            request.input("Description", Description || null);
            request.input("INCI", INCI || null);
            request.input("ISO_16128_Natural_Origin_Content", ISO_16128_Natural_Origin_Content || null);
            request.input("Batch_Lot_No", Batch_Lot_No || null);
            request.input("Expiry_date", Expiry_date || null);
            request.input("Key_In_Date", Key_In_Date || null);
            request.input("Appearance", Appearance || null);
            request.input("Country_Of_Origin", Country_Of_Origin || null);
            request.input("Source_Of_Origin", Source_Of_Origin || null);
            request.input("Dossage", Dossage || null);
            request.input("Write_up", Write_up || null);
            request.input("Preservative", Preservative || null);
            request.input("Remark", Remark || null);
            request.input("Awards", Awards || null);
            request.input("Comedogenic_Rating", Comedogenic_Rating || null);
            request.input("Online_Feedback", Online_Feedback || null);
            request.input("Category", Category || null);
            request.input("Upcycle", Upcycle || null);
            request.input("Sustainability", Sustainability || null);
            request.input("Cruelty_Free", Cruelty_Free || null);
            request.input("Vegan_friendly", Vegan_friendly || null);

            await request.query(`
                INSERT INTO [RawMaterialsDB].[dbo].[RawMat] 
                (Code, Description, INCI, ISO_16128_Natural_Origin_Content, Batch_Lot_No, Expiry_date,
                Key_In_Date, Appearance, Country_Of_Origin, Source_Of_Origin, Dossage, Write_up, 
                Preservative, Remark, Awards, Comedogenic_Rating, Online_Feedback, Category, Upcycle,
                Sustainability, Cruelty_Free, Vegan_friendly, [timestamp])
                VALUES 
                (@Code, @Description, @INCI, @ISO_16128_Natural_Origin_Content, @Batch_Lot_No, @Expiry_date,
                @Key_In_Date, @Appearance, @Country_Of_Origin, @Source_Of_Origin, @Dossage, @Write_up,
                @Preservative, @Remark, @Awards, @Comedogenic_Rating, @Online_Feedback, @Category,
                @Upcycle, @Sustainability, @Cruelty_Free, @Vegan_friendly, GETUTCDATE())
            `);            

            res.status(201).json({ success: "Raw material entry added successfully" });
        } catch (err) {
            console.error("Error inserting data into database:", err);
            res.status(500).json({ error: "Database insert failed" });
        }
    });

    // Route to get all entries from RawMat table with limited attributes
    app.get("/api/rawmat", async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request().query("SELECT Code, Description, INCI, timestamp FROM [RawMaterialsDB].[dbo].[RawMat]");
            res.json(result.recordset);
        } catch (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Failed to fetch data" });
        }
    });

    // Route to get a specific entry by Code with full details
    app.get("/api/rawmat/:code", async (req, res) => {
        try {
            const { code } = req.params;
            const pool = await sql.connect(config);
            const request = pool.request();
            request.input("code", sql.NVarChar, code);
            const result = await request.query(`SELECT * FROM [RawMaterialsDB].[dbo].[RawMat] WHERE Code = @code`);
            res.json(result.recordset);
        } catch (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Failed to fetch data" });
        }
    });

    // Route to delete an entry from the RawMat table by Code
    app.delete("/api/rawmat/:code", async (req, res) => {
        try {
            const { code } = req.params;
            const pool = await sql.connect(config);
            const request = pool.request();
            request.input("code", sql.NVarChar, code);
            const result = await request.query("DELETE FROM [RawMaterialsDB].[dbo].[RawMat] WHERE Code = @code");

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: "Raw material not found" });
            }

            res.json({ success: "Raw material deleted successfully" });
        } catch (err) {
            console.error("Error deleting data:", err);
            res.status(500).json({ error: "Failed to delete data" });
        }
    });


    // Route to update an entry in the RawMat table
    app.post("/api/rawmat/edit/:code", async (req, res) => {
        try {
            const { code } = req.params;
            const {
                Description, INCI, ISO_16128_Natural_Origin_Content, Batch_Lot_No, Expiry_date,
                Key_In_Date, Appearance, Country_Of_Origin, Source_Of_Origin, Dossage, Write_up,
                Preservative, Remark, Awards, Comedogenic_Rating, Online_Feedback, Category, Upcycle,
                Sustainability, Cruelty_Free, Vegan_friendly
            } = req.body;
            
            const request = pool.request();
            request.input("code", sql.NVarChar, code);

            let updateQuery = "UPDATE [RawMaterialsDB].[dbo].[RawMat] SET ";
            const queryParams = [];

            // Function to handle empty or null values by assigning them NULL in the database
            const handleNull = (value) => (value === "" || value === null ? null : value);

            // Add parameters to the query, and assign `NULL` if field is empty or null
            if (Description !== undefined) {
                updateQuery += "Description=@Description, ";
                queryParams.push({ name: "Description", value: handleNull(Description) });
            }
            if (INCI !== undefined) {
                updateQuery += "INCI=@INCI, ";
                queryParams.push({ name: "INCI", value: handleNull(INCI) });
            }
            if (ISO_16128_Natural_Origin_Content !== undefined) {
                updateQuery += "ISO_16128_Natural_Origin_Content=@ISO_16128_Natural_Origin_Content, ";
                queryParams.push({ name: "ISO_16128_Natural_Origin_Content", value: handleNull(ISO_16128_Natural_Origin_Content) });
            }
            if (Batch_Lot_No !== undefined) {
                updateQuery += "Batch_Lot_No=@Batch_Lot_No, ";
                queryParams.push({ name: "Batch_Lot_No", value: handleNull(Batch_Lot_No) });
            }
            if (Expiry_date !== undefined) {
                updateQuery += "Expiry_date=@Expiry_date, ";
                queryParams.push({ name: "Expiry_date", value: handleNull(Expiry_date) });
            }
            if (Key_In_Date !== undefined) {
                updateQuery += "Key_In_Date=@Key_In_Date, ";
                queryParams.push({ name: "Key_In_Date", value: handleNull(Key_In_Date) });
            }
            if (Appearance !== undefined) {
                updateQuery += "Appearance=@Appearance, ";
                queryParams.push({ name: "Appearance", value: handleNull(Appearance) });
            }
            if (Country_Of_Origin !== undefined) {
                updateQuery += "Country_Of_Origin=@Country_Of_Origin, ";
                queryParams.push({ name: "Country_Of_Origin", value: handleNull(Country_Of_Origin) });
            }
            if (Source_Of_Origin !== undefined) {
                updateQuery += "Source_Of_Origin=@Source_Of_Origin, ";
                queryParams.push({ name: "Source_Of_Origin", value: handleNull(Source_Of_Origin) });
            }
            if (Dossage !== undefined) {
                updateQuery += "Dossage=@Dossage, ";
                queryParams.push({ name: "Dossage", value: handleNull(Dossage) });
            }
            if (Write_up !== undefined) {
                updateQuery += "Write_up=@Write_up, ";
                queryParams.push({ name: "Write_up", value: handleNull(Write_up) });
            }
            if (Preservative !== undefined) {
                updateQuery += "Preservative=@Preservative, ";
                queryParams.push({ name: "Preservative", value: handleNull(Preservative) });
            }
            if (Remark !== undefined) {
                updateQuery += "Remark=@Remark, ";
                queryParams.push({ name: "Remark", value: handleNull(Remark) });
            }
            if (Awards !== undefined) {
                updateQuery += "Awards=@Awards, ";
                queryParams.push({ name: "Awards", value: handleNull(Awards) });
            }
            if (Comedogenic_Rating !== undefined) {
                updateQuery += "Comedogenic_Rating=@Comedogenic_Rating, ";
                queryParams.push({ name: "Comedogenic_Rating", value: handleNull(Comedogenic_Rating) });
            }
            if (Online_Feedback !== undefined) {
                updateQuery += "Online_Feedback=@Online_Feedback, ";
                queryParams.push({ name: "Online_Feedback", value: handleNull(Online_Feedback) });
            }
            if (Category !== undefined) {
                updateQuery += "Category=@Category, ";
                queryParams.push({ name: "Category", value: handleNull(Category) });
            }
            if (Upcycle !== undefined) {
                updateQuery += "Upcycle=@Upcycle, ";
                queryParams.push({ name: "Upcycle", value: handleNull(Upcycle) });
            }
            if (Sustainability !== undefined) {
                updateQuery += "Sustainability=@Sustainability, ";
                queryParams.push({ name: "Sustainability", value: handleNull(Sustainability) });
            }
            if (Cruelty_Free !== undefined) {
                updateQuery += "Cruelty_Free=@Cruelty_Free, ";
                queryParams.push({ name: "Cruelty_Free", value: handleNull(Cruelty_Free) });
            }
            if (Vegan_friendly !== undefined) {
                updateQuery += "Vegan_friendly=@Vegan_friendly, ";
                queryParams.push({ name: "Vegan_friendly", value: handleNull(Vegan_friendly) });
            }

            // Always update timestamp
            updateQuery += "timestamp=GETUTCDATE(), ";
            
            // Remove trailing comma
            if (updateQuery.trim().endsWith(",")) {
                updateQuery = updateQuery.trim().slice(0, -1);
            }        
    
            // Add the WHERE clause
            updateQuery += " WHERE Code=@code";

            // Add parameters to the request
            queryParams.forEach(param => {
                request.input(param.name, sql.NVarChar, param.value);
            });

            // Execute the query
            await request.query(updateQuery);

            res.json({ success: "Raw material entry updated successfully" });
            
        } catch (err) {
            console.error("Error updating data:", err.message);
            res.status(500).json({ error: "Failed to update data" });
        }
    });
};
