const app = require('express')();
const path = require("path")
const io = require('socket.io')();
const fs = require('fs');
let usersRawdata = fs.readFileSync('./data/users.json');
let roomsRawdata = fs.readFileSync('./data/rooms.json');
let chatDataRawdata = fs.readFileSync('./data/chatData.json');
let users = JSON.parse(usersRawdata);
let rooms = JSON.parse(roomsRawdata);
let chatData = JSON.parse(chatDataRawdata);
console.log(users)
app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname,'index.html'));
})
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('login', (data) => {
      console.log(data)
        let user = users.find(user => user.username === data.username)
        if (user === undefined) {
          socket.emit("loginstate", "Tài khoản không tồn tại");console.log("Login not successful")
        } else {
          if(user.password === data.password) {
            console.log("Login successful");
            socket.emit('loginstate',true)
            let chat = chatData.find(chat => chat.roomcode = user.roomcode);
            socket.emit('getMessage',chat)
            socket.on('message',(msg)=>{
              chat.data.push({
                sender: user.username,
                message: msg,
              })
              console.log(chat)
              socket.emit('getMessage',chat)
            })
            
            socket.on('update', ()=>{
              socket.emit('getMessage',chat)
            })
          } else {
            socket.emit("loginstate", "Tên đăng nhập hoặc mật khẩu không đúng");
            console.log("Login not successful")
          }
        }
        
      });
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  });
  setInterval(()=>{
    let chatDataData = JSON.stringify(chatData);
    let roomsData = JSON.stringify(rooms);
    let usersData = JSON.stringify(users);
    fs.writeFileSync('./data/chatData.json', chatDataData); 
    fs.writeFileSync('./data/rooms.json', roomsData); 
    fs.writeFileSync('./data/users.json', usersData); 
    console.log("Data saved!")
  },10000)
app.listen(3000, () => {
    console.log('listening on *:3000');
  });