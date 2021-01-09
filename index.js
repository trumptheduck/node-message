const app = require('express')();
const http = require('http').Server(app);
const path = require("path")
const io = require('socket.io')(http);
const users = [
  {
    username: "nhatyt123",
    password: "nhat1234",
    roomcode: '20205201314',
  },
  {
    username: "hanghang1323",
    password: "hang1234",
    roomcode: '20205201314',
  }
]
const rooms = ['20205201314']
let chatData = [
  {
    roomcode: '20205201314',
    data:[]
}
]
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
            socket.emit('loginstate',user.roomcode)
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
  
http.listen(3000, () => {
    console.log('listening on *:3000');
  });