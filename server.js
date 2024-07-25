import express from "express";
import cors from "cors";
import mssql from "mssql";

const app = express();
const PORT = 3000;

const cordsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}
const sqlConfig = {
    user: 'sa',
    password: 'vinicio123',
    server: 'localhost', 
    database: 'practica',
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: 1433
};

async function connectDB() {
    try {
        await mssql.connect(sqlConfig);
        console.log('DB Connected');
    } catch (error) {
        console.log('Error on connect DB', error);
    }
}

app.use(cors(cordsOptions));
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('Hello World');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})