
var winH = (window.innerHeight);
var winW = window.innerWidth;


function preload() {
  game.load.image('starfield', 'https://raw.githubusercontent.com/jschomay/phaser-demo-game/master/assets/starfield.png');
  game.load.image('ship1', '../assets/ship.png');
  game.load.image('bullet', '../assets/bullet.png');
}

var sprite;
var text;
var game = new Phaser.Game(1920, 1920, Phaser.CANVAS, 'phaser', { preload: preload, create: create, update: update });
function create() {

    starfield = game.add.tileSprite(0, 0, 4000, 4000, 'starfield');
   
    game.world.setBounds(0, 0, 4000, 4000);

    ship1 = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(ship1, Phaser.Physics.ARCADE);

    game.camera.x=game.world.width;
    game.camera.y=game.world.height;
    game.camera.follow(ship1);

   	bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);


}

function update() {
        
        if (game.input.activePointer.isDown) {
       		 game.physics.arcade.moveToPointer(ship1, 300);
       		 fire();
       	}
       	else {
       		ship1.body.velocity.setTo(0, 0);
       	}


        ship1.rotation = game.physics.arcade.angleToPointer(ship1);
    
}

function fire() {
	var bullet = bullets.getFirstExists(false);

	if(bullet) {
		bullet.reset(ship1.x, ship1.y +8);
		bullet.rotation = game.physics.arcade.angleToPointer(bullet);
		game.physics.arcade.moveToPointer(bullet, 400);
	}
}