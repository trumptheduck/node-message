const app = require('express')();
const http = require('http').Server(app);
const path = require("path")
const io = require('socket.io')(http);
const fs = require('fs');
const PORT = 4000;
const users = [
    {
        email:"nhatyt123@gmail.com",
        hash: {
            hashedpassword: 'a5fff7bc09896ab86b0bff7957420514c2983a16207c59458c2b324ed1f8e24065666e97c271f82bab76ca23b868904a290a4318491b0125d32d70cde4c6960e',
            salt: "f2d225484b13"
        },
        apikey:"abcd123456"
        

    }
];
const data = [
    {
        apikey: "abcd123456",
        dataArray:[
            {
                id: "000001",
                name: "Light 1",
                type: "toggle",
                value: {
                    client: true,
                    server: true
                }
            },
            {
                id: "000002",
                name: "Light 2",
                type: "toggle",
                value: {
                    client: false,
                    server: false
                }
            },
            {
                id: "000003",
                name: "Sensor 1",
                type: "sensor",
                value: {
                    client: 100,
                    server: 100,
                    unit: "Celcius"
                }
            },
            {
                id: "000004",
                name: "Tracker 1",
                type: "gps",
                value: {
                    latt: 122.2222222,
                    long: -90.0000,
                    level: 10.5
                }
            }
        ]

    }
]

//Password Hash
let crypto = require('crypto');
// logger 
let logger = func => {
    console.log(func);
};
let generateSalt = rounds => {
    if (rounds >= 15) {
        throw new Error(`${rounds} is greater than 15,Must be less that 15`);
    }
    if (typeof rounds !== 'number') {
        throw new Error('rounds param must be a number');
    }
    if (rounds == null) {
        rounds = 12;
    }
    return crypto.randomBytes(Math.ceil(rounds / 2)).toString('hex').slice(0, rounds);
};
logger(generateSalt(12))
let hasher = (password, salt) => {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        hashedpassword: value
    };
};
let hash = (password, salt) => {
    if (password == null || salt == null) {
        throw new Error('Must Provide Password and salt values');
    }
    if (typeof password !== 'string' || typeof salt !== 'string') {
        throw new Error('password must be a string and salt must either be a salt string or a number of rounds');
    }
    return hasher(password, salt);
};
logger(hash('nhat1234', generateSalt(12)))
let compare = (password, hash) => {
    if (password == null || hash == null) {
        throw new Error('password and hash is required to compare');
    }
    if (typeof password !== 'string' || typeof hash !== 'object') {
        throw new Error('password must be a String and hash must be an Object');
    }
    let passwordData = hasher(password, hash.salt);
    if (passwordData.hashedpassword === hash.hashedpassword) {
        return true;
    }
    return false
};
let makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
//End of password hash
//User Management
const AccountManager = {
    newAccount(username,password) {
        users.push({
            email : username,
            hash : hash(password,generateSalt(12)),
            apikey: makeid(32)
        });
        console.log(`Account: ${username} has been created!`)
        console.log('Users:',users)
    },
    deleteAccount(username) {
        users = users.filter(user => user.email === username);
        console.log(`Account: ${username} is deleted!`)
        console.log('Users:',users)
    }
}
AccountManager.newAccount("asdadasdad","nhat1234")
console.log(users)
//End of User Management
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/app/index.html"));
})
io.on('connection',(socket)=>{
    console.log("A connection has been established!")
    socket.on('login',(credentials) => {
        let user = users.find(user => user.email = credentials.email)
        if (user === undefined) {
            socket.emit('loginState',"Username Invalid!")
            console.log()
        } else {
            if (!compare(credentials.password,user.hash)) {
                socket.emit('loginState',"Password Incorrect!")
            } else {
                socket.emit('loginState',true)
                console.log(`User ${user.email} is online!`)
                let userData = data.find(repo => repo.apikey === user.apikey)
                socket.emit('systemData', userData )
                socket.on('deleteAccount',()=>{
                    AccountManager.deleteAccount(user.email)
                })
            }
        }
    })
    socket.on('new-account', (credentials)=>{
        let user = users.find(user => user.email = credentials.email)
        if (user === undefined) {
            AccountManager.newAccount(credentials.email,credentials.password)
            socket.emit('loginState',"Account created successfully")
        } else {
            console.log("Username already existed!")
            socket.emit('loginState',"Username already existed!")
        }
        
    })
})
http.listen(PORT,() => {
    console.log(`Listening at port: ${PORT}`)
})



