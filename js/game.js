// create a new scene named "Game"
let gameScene = new Phaser.Scene('Game');


// some parameters for our scene
gameScene.init = function() {
  this.playerSpeed = 1.75;
  this.enemySpeed = 2;
  this.enemyMaxY = 280;
  this.enemyMinY = 80;
}

// load asset files for our game
gameScene.preload = function() {

  // load images
  this.load.image('background', 'assets/background.png');
  this.load.image('space_viking', 'assets/space_viking.png');
  this.load.image('aether', 'assets/aether.png');
  this.load.atlas('player', 'assets/player.png', 'assets/player_atlas.json');
  this.load.animation('player_anim', 'assets/player_anim.json');
};

// executed once, after assets were loaded
gameScene.create = function() {

  // background
  let bg = this.add.sprite(0, 0, 'background');

  // change origin to the top-left of the sprite
  bg.setOrigin(0, 0);

  // player
  this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');

  // scale down
  this.player.setScale(0.5);

  // goal
  this.aether = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'aether');
  this.aether.setScale(0.6);

  // group of enemies
  this.enemies = this.add.group({
    key: 'space_viking',
    repeat: 5,
    setXY: {
      x: 110,
      y: 100,
      stepX: 80,
      stepY: 20
    }
  });

  // scale enemies
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);

  // set speeds
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    enemy.speed = Math.random() * 2 + 1;
  }, this);

  // game over text
  this.gameOverText;

  this.gameOverText = this.add.text(
    this.sys.game.config.width * 0.5,
    this.sys.game.config.height * 0.5,
    "Game Over!",
    { font: "50px Arial", fill: "#EE4B2B"
  });
  this.gameOverText.setOrigin(0.5);
  this.gameOverText.visible = false;

  // You Win! text

  this.youWinText;

  this.youWinText = this.add.text(
    this.sys.game.config.width * 0.5,
    this.sys.game.config.height * 0.5,
    "You Win!",
    { font: "50px Arial", fill: "#FFD700"
  });
  this.youWinText.setOrigin(0.5);
  this.youWinText.visible = false;
  
  // set lives
  this.playerLives = 3
  this.livesText;
  this.lifeLostText;

  this.livesText = this.add.text(this.sys.game.config.width - 5, 5, `Lives: ${this.playerLives}`, {
    font: "18px Arial",
    fill: "#ffffff",
  });
  this.livesText.setOrigin(1, -3);
  this.lifeLostText = this.add.text(
    this.sys.game.config.width * 0.5,
    this.sys.game.config.height * 0.5,
    "Life lost!",
    { font: "18px Arial", fill: "#ffffff" }
  );
  this.lifeLostText.setOrigin(0.5);
  this.lifeLostText.visible = false;

  // player is alive
  if (this.playerLives >= 0) {
    this.isPlayerAlive = true;
  }
  else if (this.playerLives == 0) {
    this.isPlayerAlive = false;
  }

  // reset camera
  this.cameras.main.resetFX();
};

// game scene is set - everything below is playing

// executed on every frame (60 times per second)
gameScene.update = function() {

  // animation
  this.player.anims.play('player_standstill', true);

  // only if the player is alive
  if (!this.isPlayerAlive) {
    return;
  }

  // check for active input
  if (this.input.activePointer.isDown) {

    // player walks
    this.player.x += this.playerSpeed;
    this.lifeLostText.visible = false;
    this.player.anims.play('player_walk_right', true);
  }

  // aether collision
  if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.aether.getBounds())) {
    this.youWin();
  }

  // enemy movement and collision
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {

    // move enemies
    enemies[i].y += enemies[i].speed;

    // reverse movement if reached the edges
    if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
      enemies[i].speed *= -1;
    } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
      enemies[i].speed *= -1;
    }

    // enemy collision
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
      this.loseLife();
      break;
    }
  }
};

gameScene.loseLife = function() {

  // subtract one from lives
  this.playerLives --;

  if (this.playerLives) {
    this.livesText.setText(`Lives: ${this.playerLives}`);
    this.lifeLostText.visible = true;
  } 
  else {
    this.gameOverText.visible = true;

  // fade camera
  this.time.delayedCall(1000, function() {
    this.cameras.main.fade(250);
  }, [], this);    

  // restart game
    this.time.delayedCall(3000, function() {
    this.scene.restart();
  }, [], this);
  }

  // shake the camera
  this.cameras.main.shake(200);

  // reset sprite to starting position
  this.player.setPosition(40, this.sys.game.config.height / 2)
};

gameScene.youWin = function() {

  // flag to set player is dead
  this.isPlayerAlive = false;

  // shake the camera
  this.cameras.main.shake(100);

  this.youWinText.visible = true;

  // restart game
  this.time.delayedCall(3000, function() {
    this.scene.restart();
  }, [], this);

  this.youWinText.visible = true;

};

// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);

// need to move game over from alert to on screen text and restart game.