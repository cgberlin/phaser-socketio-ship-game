
var winH = (window.innerHeight);
var winW = window.innerWidth;
var socket = io();

var shipPosition;

function preload() {
  game.load.image('starfield', 'https://raw.githubusercontent.com/jschomay/phaser-demo-game/master/assets/starfield.png');
  game.load.image('ship1', '../assets/ship1.png');
  game.load.image('bullet', '../assets/bullet.png');
  game.load.image('asteroidMed', '../assets/asteroid-medium.png')
}

var sprite;
var text;
var game = new Phaser.Game(1920, 1920, Phaser.CANVAS, 'phaser', { preload: preload, create: create, update: update });
function create() {

    starfield = game.add.tileSprite(0, 0, 4000, 4000, 'starfield');
   
    game.world.setBounds(0, 0, 4000, 4000);

    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    var numberOfAsteroids = game.rnd.integerInRange(150, 200);
    for (var i = 0; i < numberOfAsteroids; i++){
    	var asteroid = asteroids.create(game.rnd.integerInRange(30, game.world.width), game.rnd.integerInRange(30, game.world.height), 'asteroidMed');
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.angularVelocity = game.rnd.integerInRange(50, 150);
 
	    var randomAngle = game.math.degToRad(game.rnd.angle());
	    var randomVelocity = game.rnd.integerInRange(50, 150);
	 	
	    game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
   		asteroid.body.collideWorldBounds = true;
   		asteroid.body.bounce.setTo(0.9, 0.9);
    }

    ship1 = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(ship1, Phaser.Physics.ARCADE);
    ship1.enableBody=true;

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
		shipPosition = ship1.position;
		socket.emit('enemyMove', shipPosition);
        
        if (game.input.activePointer.isDown) {
       		 game.physics.arcade.moveToPointer(ship1, 300);
       		 fire();
       	}
       	else {
       		ship1.body.velocity.setTo(0, 0);
       	}

        ship1.rotation = game.physics.arcade.angleToPointer(ship1);

        game.physics.arcade.collide(asteroids);

        game.physics.arcade.overlap(bullets, asteroids, bulletHitAsteroid, null, this);
        game.physics.arcade.overlap(ship1, asteroids, shipHitAsteroid, null, this);
       
    
}

function fire() {
	var bullet = bullets.getFirstExists(false);

	if(bullet) {
		bullet.reset(ship1.x, ship1.y +8);
		bullet.rotation = game.physics.arcade.angleToPointer(bullet);
		game.physics.arcade.moveToPointer(bullet, 400);
	}
}


function shipHitAsteroid() {
	alert('game over');
	ship1.kill();
	game.state.restart();
}

function bulletHitAsteroid(bullet, asteroid) {
	bullet.kill();
	asteroid.kill();
}

socket.on('updateEnemyMove', function(enemyLocation){
		enemyShip.position.x = enemyLocation.x;
		enemyShip.position.y = enemyLocation.y;
});

socket.on('newEnemy', function(){
	console.log('new enemy');
	enemyShip = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(enemyShip, Phaser.Physics.ARCADE);
    enemyShip.enableBody=true;
    socket.emit('playerMove', shipPosition);
});

socket.on('yourEnemyIfNewConnect', function(location){
	enemyShip = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(enemyShip, Phaser.Physics.ARCADE);
    enemyShip.enableBody=true;
});