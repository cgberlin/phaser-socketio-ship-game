
var winH = (window.innerHeight);
var winW = window.innerWidth;


function preload() {
  game.load.image('bg', 'http://i.imgur.com/IqhJZmI.jpg');
  game.load.image('ship1', '../assets/ship/Ships/ship1/1stship_3.png');
}

var sprite;
var text;
var game = new Phaser.Game(winW, winH, Phaser.CANVAS, 'phaser', { preload: preload, create: create, update: update });
function create() {

    bg = game.add.tileSprite(0,0, game.width, game.height, 'bg');
    bg.tileScale.x=0.5;
    bg.tileScale.y=0.5;
    ship1 = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');
    game.physics.enable(ship1, Phaser.Physics.ARCADE);

}

function update() {
	bg.tilePosition.x--;
	    //  only move when you click
    if (game.input.mousePointer.isDown)
    {
        //  400 is the speed it will move towards the mouse
        game.physics.arcade.moveToPointer(ship1, 400);

        //  if it's overlapping the mouse, don't move any more
        if (Phaser.Rectangle.contains(ship1.body, game.input.x, game.input.y))
        {
            ship1.body.velocity.setTo(0, 0);
        }
    }
    else
    {
        ship1.body.velocity.setTo(0, 0);
    }
}