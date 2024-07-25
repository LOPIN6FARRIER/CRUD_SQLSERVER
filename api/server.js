import express from "express";
import cors from "cors";
import mssql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: parseInt(process.env.DB_PORT)
};

console.log('Database configuration:', sqlConfig);

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/tasks', async (req, res) => {
    try {
        const pool = await mssql.connect(sqlConfig);
        const result = await pool.request().query('SELECT * FROM tasks');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL query error:', err);
        res.status(500).send('Internal server error');
    } finally {
        await mssql.close();
    }
});

app.post('/add-task', async (req, res) => {
    const { TaskName, CreatedAt } = req.body;
    try {
        const pool = await mssql.connect(sqlConfig);
        const result = await pool.request()
            .input('TaskName', mssql.VarChar(255), TaskName)
            .input('CreatedAt', mssql.DateTime, CreatedAt)
            .execute('sp_AddTask');
        
        res.json({ message: 'Task added successfully', result: result.recordset });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Internal server error');
    } finally {
        await mssql.close();
    }
});

app.delete('/delete-task/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await mssql.connect(sqlConfig);
        const result = await pool.request()
            .input('TaskID', mssql.Int, id)
            .execute('sp_DeleteTask');
        
        res.json({ message: 'Task deleted successfully', result: result.recordset });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Internal server error');
    } finally {
        await mssql.close();
    }
})

app.get('/task/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await mssql.connect(sqlConfig);
        const result = await pool.request()
            .input('TaskID', mssql.Int, id)
            .execute('sp_GetTask');
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Internal server error');
    } finally {
        await mssql.close();
    }
})

app.put('/update-task/:id', async (req, res) => {
    const { id } = req.params;
    const { TaskName, CreatedAt } = req.body;
    try {
        const pool = await mssql.connect(sqlConfig);
        const result = await pool.request()
            .input('TaskID', mssql.Int, id)
            .input('TaskName', mssql.VarChar(255), TaskName)
            .input('CreatedAt', mssql.DateTime, CreatedAt)
            .execute('sp_UpdateTask');
        
        res.json({ message: 'Task updated successfully', result: result.recordset });
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Internal server error');
    } finally {
        await mssql.close();
    }
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
