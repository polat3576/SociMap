module.exports=(io)=>{
io.on('connection', (socket)=>{
console.log(`bağlanti basladi: ${socket.id}`);
    
socket.on('flutter_mesaji', (data) => {
    console.log(` MESAJ VAR: ${data}`);
socket.emit('sunucu_cevabi',{message:'sunucu acik'});
});
socket.on('disconnect',()=>{
console.log(`bağlanti koptu ${socket.id} `);
  });

});
};