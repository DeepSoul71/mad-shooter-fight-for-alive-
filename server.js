
const express = require('express');
const path = require('path');

const Shooter = require('./shooter');
const ShooterManager = new Shooter();


const app = express();
const server = require('http').createServer(app);

var io = require('socket.io')(server);
io.on('connection', function(client){
    console.log("connected!");
    client.on('sendName', function(data){
        const userip = client.conn.remoteAddress;
        ShooterManager.addUser({...data, userip : userip, socket:client});
        
        if(data.name.trim().length == 0){
            data.name = "Mad Guy!~";
        }
        if(data.name.trim().length > 10){
            data.name = data.name.trim().substr(0, 10);
        }
        let colCheck = false;
        const colors = ["dodgerblue", "violet", "mediumseagreen", "slateblue", "tomato"];
        for(let curColor of colors){
            if(data.color == curColor){
                colCheck = true;
                break;
            }
        }
        if(colCheck != true) data.color = "black";
        console.log(data.name.length, data.color);
        for(let shooter of ShooterManager.shooters){
            if(shooter.ip == userip){
                client.emit('initial', {shooter : shooter, myip:userip});

//                client.emit('server_status', {shooters : ShooterManager.shooters, bullets:bullets, items:ShooterManager.items});
                break;
            }
        }
    });
    console.log(client.conn.remoteAddress);

    client.on('client_status', function(data){
        ShooterManager.updateShooter(data.shooter);
        const bullets = [];
        for(let shooter of ShooterManager.shooters){
            for(let bullet of shooter.bullets){    
                const bulletinfo = {};
                bulletinfo.width = bullet.width;
                bulletinfo.height = bullet.height;
                bulletinfo.color = bullet.color;
                bulletinfo.angle = bullet.angle;
                bulletinfo.x = bullet.x;
                bulletinfo.y = bullet.y;
                bullets.push(bulletinfo);
            }
        }
        // if(ShooterManager.checkDied()){
        //     if(data.shooter.ip == ShooterManager.checkDied())
        //         client.emit('died');
        // }
        client.emit('server_status', {shooters : ShooterManager.shooters, bullets:bullets, items:ShooterManager.items});
    });

    client.on('disconnect', function(){
        // ShooterManager.deleteUser(client.conn.remoteAddress);
        console.log('.....disconnect');
    });
});



const port = 7000;
app.use(express.static('public'));

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});