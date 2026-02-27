require('dotenv').config(); // bu kütüphane .env dosyamızın içinden db şifresi gibi gizli bilgileri okur 
const http = require("http");// http modulünü eklememizi sağlar handshake yapmamız için gerekli 
const  {Server} = require("socket.io");//real-time işlemleri gerçekleştirmemizi sağlayan kütüphane 
const app = require("./app");



const socimapserver = http.createServer(app);//buradada app'i http içine kilitler

const io = new Server(socimapserver,{// socket io sunucusunu başlatır sunucuya gelen istekler (requere) socket io tarafından içeri alınır
    cors:{
        origin:'*',// içerdeki ikinci güvenliktir * anlamı dünyadaki herkes bağlanabilir ama sadece geliştirme aşaması için daha sonra değiştireceğiz 
        methods:["GET","POST"]// handshake kurarken perde arkasında kklasik http yöntemlerini kullanılır bunlara izin verilmezse handshake basarısız olur
    }

});
require("./sockets")(io); //index.js içinde io değişkenini bulup getirir
  const PORT = (process.env.PORT)|| 3000;// env dosyasını okur içinde port bilgisi bulamssa 3000 de açar
  socimapserver.listen(PORT,()=>{
    console.log(`sunucu ${PORT} portunda`);
  });
