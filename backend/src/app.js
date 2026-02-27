const express = require("express");
const cors = require("cors");

const app = express();// express kütüphanesinde bir uygulama örneği yaratır

// Middleware'ler
app.use(cors());//ara karman ekler app ' e kim gelirse gelsin içeri al talimati verir
app.use(express.json()); // Gelen JSON paketlerini açip okuyabilmek için
app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "SociMap HTTP API Hazır" 
    });
});

module.exports = app;