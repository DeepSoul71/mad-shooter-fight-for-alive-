const shooter = require('./shooter');
const item = require('./items');


function ShooterManager () {
  this.shooters = [];
  this.items = [];
  this.sockets = new Map();
  this.timer = setInterval(()=>{
    for(let shooter of this.shooters){
      shooter.genBullet();
    }
    this.checkShoot();
    this.checkItem();
  }, 20);

  this.itemClock = setInterval(()=>{
    this.generateItem();
  },10000);

  this.generateItem = () => {
    let itemType = Math.round(Math.random() * 10);
    const pos = this.posGenerator();
    // console.log(pos, itemType);
    let newitem = new item(itemType, 20, pos.x, pos.y);
    this.items.push(newitem);
  }

  this.checkItem = () => {
    for (let i = 0; i < this.items.length; i++) {
      for (let shooter of this.shooters) {
        if (this.items[i].getItem(shooter)) {
          shooter.catchItem(this.items[i]);
          this.items.splice(i, 1);
          break;
        }
      }
    }
  }

  this.checkShoot = () => {
    for(let shooter of this.shooters){
      for(let i = 0; i < shooter.bullets.length; i++){
        for(let j = 0; j < this.shooters.length; j++){
          if(shooter.ip == this.shooters[j].ip){
            continue;
          }
          if(shooter.bullets[i].shoot(this.shooters[j])){
            this.shooters[j].getDamage(shooter.bullets[i].damage);
            
            shooter.bullets.splice(i, 1);
            if(this.shooters[j].heart <= 0){ //Other has broken!
              shooter.exp += (this.shooters[j].exp / 10 + 1) * 10;
              shooter.heart += 30;
              shooter.damage += 2;
              this.sockets.get(this.shooters[j].ip).emit('died');
              this.shooters.splice(j, 1);
              
              if(shooter.exp >= (Math.pow( 2 , shooter.level) * 10)) shooter.levelUp();
            }
            break;
          }
        }
      }
    }
  }

  this.addUser = (data) => {
    if(this.findShooter(data.userip) !== -1){
      return;
    }
    const shooterPos = this.posGenerator();
    
    const newShooter = new shooter(shooterPos.x, shooterPos.y, data.color, data.name, data.userip, 0);

    this.shooters.push(newShooter);
    this.sockets.set(data.userip, data.socket);
    console.log(this.shooters);
  }

  this.posGenerator = () => {
    const pos = {x:'0', y:'0'};
    pos.x = Math.round(Math.random()*4000);
    pos.y = Math.round(Math.random()*4000);
    return pos;
  }

  this.findShooter = (data) => {
    const index = this.shooters.map(shooter => shooter.ip).indexOf(data);
    return index;
  }

  this.updateShooter = (data) => {
    for(let i = 0; i < this.shooters.length; i++){
      if(data.ip == this.shooters[i].ip){
        this.shooters[i].update(data);
      }
    }
  }

  this.updateBullets = (shooterIP, name, data) => {
    for(let i = 0; i < this.bullets.length; i++){
      if(shooterIP == this.bullets[i].ip){
        this.bullets.splice(i, 1);
      }
    }
    this.bullets = [...this.bullets, ...data];
  }

  this.deleteUser = (ip) => {
    const index = this.shooters.map(shooter => shooter.ip).indexOf(ip);
    if (index !== -1) {
        this.shooters.splice(index, 1);
    }
  }

}



module.exports = ShooterManager;