
const http = require("http");// http modulünü eklememizi sağlar handshake yapmamız için gerekli 
const  {Server} = require("socket.io");//real-time işlemleri gerçekleştirmemizi sağlayan kütüphane 
const app = require("../index");



const socimapserver = http.createServer(app);//buradada app'i http içine kilitler

const io = new Server(socimapserver,{// socket io sunucusunu başlatır sunucuya gelen istekler (requere) socket io tarafından içeri alınır
    cors:{
        origin:'*',// içerdeki ikinci güvenliktir * anlamı dünyadaki herkes bağlanabilir ama sadece geliştirme aşaması için daha sonra değiştireceğiz 
        methods:["GET","POST"]// handshake kurarken perde arkasında kklasik http yöntemlerini kullanılır bunlara izin verilmezse handshake basarısız olur
    }

});
require("./sockets/socket")(io); //socket.js içinde io parametrisini bulup getirir
  const PORT = (process.env.PORT)|| 3000;// env dosyasını okur içinde port bilgisi bulamssa 3000 de açar
  socimapserver.listen(PORT, '0.0.0.0', ()=>{
    console.log(`sunucu ${PORT} portunda`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  });
  