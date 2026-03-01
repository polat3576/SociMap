const express = require('express');
const { Pool } = require('pg');

const app = express();
// Çok Önemli: Dışarıdan gelen JSON formatındaki verileri okuyabilmek için bunu ekliyoruz
app.use(express.json()); 

const port = 3000;

// Veritabanı bağlantı ayarları
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- 1. KULLANICI KAYIT API'Sİ ---
app.post('/api/users', async (req, res) => {
  try {
    // 1. Kullanıcının gönderdiği verileri alıyoruz
    const { username, email, password } = req.body;

    // 2. Veritabanına INSERT komutu ile ekliyoruz
    // Güvenlik için $1, $2 gibi parametreler kullanıyoruz (SQL Injection'ı önler)
    const yeniKullanici = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role",
      [username, email, password]
    );

    // 3. Başarı mesajı ve kaydedilen veriyi geri dönüyoruz
    res.status(201).json({
      mesaj: "Kullanıcı başarıyla kaydedildi! 🎉",
      kullanici: yeniKullanici.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ hata: "Kayıt işlemi başarısız.", detay: error.message });
  }
});
// --- 2. ETKİNLİK OLUŞTURMA API'Sİ (PostGIS Sihri Burada! 🗺️) ---
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, latitude, longitude, creator_id } = req.body;

    // PostGIS için Kritik Bilgi:
    // ST_MakePoint(Boylam, Enlem) sırasıyla alır. (Önce Longitude, sonra Latitude!)
    // 4326: GPS koordinat sistemi kodudur.
    
    const yeniEtkinlik = await pool.query(
      `INSERT INTO events (title, description, location, creator_id, start_time)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, NOW())
       RETURNING id, title, description, ST_AsText(location) as koordinat`,
      [title, description, longitude, latitude, creator_id]
    );

    res.status(201).json({
      mesaj: "Etkinlik haritaya başarıyla işlendi! 📍",
      etkinlik: yeniEtkinlik.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ hata: "Etkinlik oluşturulamadı.", detay: error.message });
  }
});
// --- 3. YAKINDAKİ ETKİNLİKLERİ GETİR (PostGIS: ST_DWithin) ---
app.get('/api/events/nearby', async (req, res) => {
  try {
    // Kullanıcıdan gelen parametreleri alalım (URL'den gelecek)
    // Örn: ?lat=38.4237&long=27.1428&mesafe=1000
    const { lat, long, mesafe } = req.query;

    if (!lat || !long) {
      return res.status(400).json({ hata: "Lütfen enlem (lat) ve boylam (long) gönderin." });
    }

    // PostGIS'in en güçlü fonksiyonu: ST_DWithin
    // Bu sorgu: "Verilen noktaya X metre mesafedeki tüm kayıtları getir" der.
    const result = await pool.query(
      `SELECT id, title, description, 
              ST_Y(location::geometry) as latitude, 
              ST_X(location::geometry) as longitude
       FROM events 
       WHERE ST_DWithin(
         location, 
         ST_SetSRID(ST_MakePoint($1, $2), 4326), 
         $3
       )`,
      [long, lat, mesafe || 1000] // Mesafe gelmezse varsayılan 1000 metre (1 km) alır
    );

    res.json({
      mesaj: `${result.rowCount} adet yakında etkinlik bulundu.`,
      etkinlikler: result.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ hata: "Sorgu hatası", detay: error.message });
  }
});
// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde dinleniyor...`);
});