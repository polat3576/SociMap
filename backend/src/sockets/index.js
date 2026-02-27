module.exports=(io)=>{
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
};
