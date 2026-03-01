const express = require('express');
const { Pool } = require('pg');
const http = require('http'); 
const { Server } = require("socket.io"); 
const swaggerUi = require('swagger-ui-express'); // Sadece UI kütüphanesi yeterli

const app = express();
app.use(express.json());

const port = 3000;

// Veritabanı Bağlantısı
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- 🛡️ GARANTİLİ SWAGGER AYARI (JSON FORMATI) ---
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SOCIMAP API Dokümantasyonu',
    version: '1.0.0',
    description: 'Dokuz Eylül Üniversitesi Bitirme Projesi - Konum Tabanlı Sosyal Etkileşim Platformu API Uç Noktaları'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Yerel Sunucu' }],
  paths: {
    '/api/users': {
      post: {
        summary: 'Sisteme yeni bir kullanıcı kaydeder.',
        tags: ['Kullanıcılar'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'enes_yazilimci' },
                  email: { type: 'string', example: 'enes@socimap.com' },
                  password: { type: 'string', example: 'gizlisifre123' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Kullanıcı başarıyla kaydedildi.' } }
      }
    },
    '/api/events': {
      post: {
        summary: 'Haritada yeni bir etkinlik (Pin) oluşturur.',
        tags: ['Etkinlikler'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Alsancak Kordon Kahve' },
                  description: { type: 'string', example: 'Proje toplantısı' },
                  latitude: { type: 'number', example: 38.4381 },
                  longitude: { type: 'number', example: 27.1418 },
                  creator_id: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Etkinlik oluşturuldu.' } }
      }
    },
    '/api/events/nearby': {
      get: {
        summary: 'Belirtilen koordinatın çevresindeki etkinlikleri listeler.',
        tags: ['Etkinlikler'],
        parameters: [
          { in: 'query', name: 'lat', schema: { type: 'number' }, required: true, example: 38.4381 },
          { in: 'query', name: 'long', schema: { type: 'number' }, required: true, example: 27.1418 },
          { in: 'query', name: 'mesafe', schema: { type: 'number' }, required: false, example: 1500 }
        ],
        responses: { '200': { description: 'Yakındaki etkinliklerin listesi.' } }
      }
    }
  }
};

// Swagger'ı sunucuya bağla
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// --- API UÇ NOKTALARI ---

app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role",
      [username, email, password]
    );
    res.status(201).json({ mesaj: "Kayıt başarılı", kullanici: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, latitude, longitude, creator_id } = req.body;
    const result = await pool.query(
      `INSERT INTO events (title, description, location, creator_id, start_time)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, NOW())
       RETURNING id, title, ST_AsText(location) as loc`,
      [title, description, longitude, latitude, creator_id]
    );
    res.status(201).json({ mesaj: "Etkinlik oluşturuldu", etkinlik: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/events/nearby', async (req, res) => {
  try {
    const { lat, long, mesafe } = req.query;
    if (!lat || !long) return res.status(400).json({ hata: "Lat ve long zorunludur." });

    const result = await pool.query(
      `SELECT id, title, description, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
       FROM events 
       WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)`,
      [long, lat, mesafe || 1000]
    );
    res.json({ mesaj: `${result.rowCount} etkinlik bulundu`, etkinlikler: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


module.exports=(app);