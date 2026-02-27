require('dotenv').config(); // bu kütüphane .env dosyamızın içinden db şifresi gibi gizli bilgileri okur 
const express = require("express");// web üzerinde çalışmamızı sağlayacak sunucuyu kurmaya yarar 
const http = require("http");// http modulünü eklememizi sağlar handshake yapmamız için gerekli 
const  {Server} = require("socket.io");//real-time işlemleri gerçekleştirmemizi sağlayan kütüphane 
const cors = require("cors");//tarayıcılardan gelen verikeri içeri almamızı sağlar 


const app = express();
app.use(cors());


const socimapserver = http.createServer(app);

const io = new Server(socimapserver,{
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
    
});

io.on('connection', (socket)=>{
console.log(`bağlanti basladi: ${socket.id}`);
    
socket.on('ping', (data) => {
    console.log(`yeni kişi ile bağlanti kuruldu ${data}`);
socket.emit('pong',{message:'sunucu acik'});
});
socket.on('disconnect',()=>{
console.log(`bağlanti koptu ${socket} `);
  });

});

  const PORT = (process.env.PORT)|| 3000;
  socimapserver.listen(PORT,()=>{
    console.log(`sunucu ${PORT} portunda`);
  });
