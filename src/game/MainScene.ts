import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../constants';
import { AudioService } from './AudioService';

const SKINS = {
  'NEURAL RUNNER': { body: 0x050505, glow: 0x00f0ff },
  'CYBER PHANTOM': { body: 0x2a0033, glow: 0xff00ff },
  'GOLDEN CIRCUIT': { body: 0x3d3500, glow: 0xfacc15 },
  'VOID STALKER': { body: 0x000000, glow: 0xff0000 },
  'CONCRETE KING': { body: 0xffffff, glow: 0x00ffff }
};

export default class MainScene extends Phaser.Scene {
  private vehicle!: Phaser.GameObjects.Container;
  private roadGroup!: Phaser.GameObjects.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;
  
  private speed = 600;
  private score = 0;
  private cCollected = 0;
  private distance = 0;
  private health = PLAYER_CONFIG.HEALTH;
  private maxMultiplier = 1;

  private currentLane = 1; // 0, 1, 2
  private isPaused = false;
  private isJumping = false;
  private multiplierActive = false;
  private multiplierTimer?: Phaser.Time.TimerEvent;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hitEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  // HUD Elements
  private scoreText!: Phaser.GameObjects.Text;
  private cText!: Phaser.GameObjects.Text;
  private multiplierText!: Phaser.GameObjects.Text;

  private roadGrid!: Phaser.GameObjects.Grid;
  private cyberGrid!: Phaser.GameObjects.Graphics;
  
  private swipeStartX: number = 0;
  private swipeStartTime: number = 0;
  private minSwipeDistance = 30;

  constructor() {
    super('MainScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x050208); // Dark Cyberpunk Sky
    
    this.createAtmosphere();
    this.createBackgroundGrid();
    this.createSkyline();
    this.createRoad();
    this.createTextures();
    this.createPlayer();
    
    this.obstacles = this.physics.add.group();
    this.items = this.physics.add.group();

    // Cinematic Camera Setup
    this.cameras.main.zoom = 1.0;

    // Light Trails for the car
    this.trailEmitter = this.add.particles(0, 0, 'light-trail', {
      scale: { start: 1, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      frequency: 20,
      follow: this.vehicle,
      followOffset: { x: 0, y: 30 }
    }).setDepth(5);

    // Particle Emitter for collections
    this.emitter = this.add.particles(0, 0, 'coin-tex', {
      speed: { min: -150, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      emitting: false
    });

    // Particle Emitter for hits
    this.hitEmitter = this.add.particles(0, 0, 'light-trail', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 500,
      emitting: false,
      tint: 0xff0000
    });

    // Spawn events
    this.time.addEvent({ delay: 1200, callback: this.spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 800, callback: this.spawnItem, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 10000, callback: () => { this.speed = Math.min(this.speed + 80, 2000); }, loop: true });

    // Inputs
    this.setupInputs();
    this.game.events.on('move-car', (dir: number) => this.moveLane(dir));
    this.game.events.on('resume-game', () => {
        if (this.isPaused) this.togglePause();
    });

    // Audio
    AudioService.startEngine();

    // Collision
    this.physics.add.overlap(this.vehicle, this.obstacles, this.handleObstacleCollision, undefined, this);
    this.physics.add.overlap(this.vehicle, this.items, this.handleItemCollision, undefined, this);

    this.createHUD();

    this.handleResize({ width: this.scale.width, height: this.scale.height });
  }

  private createHUD() {
    const style = { fontFamily: 'monospace', fontSize: '24px', fontStyle: 'bold', fill: '#ffffff' };
    
    // Score Top Left
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', style).setScrollFactor(0).setDepth(200);
    
    // $C Top Right
    this.cText = this.add.text(this.scale.width - 20, 20, '$C: 0', style)
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(200)
        .setTint(0xfacc15);
    
    // Multiplier Center Top
    this.multiplierText = this.add.text(this.scale.width / 2, 20, '1.0X', style)
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(200)
        .setTint(0x00f0ff);
  }

  private createSkyline() {
    const { width, height } = this.scale;
    // Dark cyberpunk city silhouette
    const city = this.add.graphics();
    city.setDepth(-8);
    city.setScrollFactor(0);
    city.fillStyle(0x020104, 1);

    // Left Side City
    for (let i = 0; i < 15; i++) {
        const bWidth = 60 + Math.random() * 100;
        const bHeight = 150 + Math.random() * 300;
        const bx = Math.random() * (width * 0.2);
        city.fillRect(bx, height - bHeight, bWidth, bHeight);
        
        // Window lights
        city.fillStyle(0x00f0ff, 0.2);
        for(let j=0; j<8; j++) {
            if(Math.random() > 0.6) city.fillRect(bx + 10, height - bHeight + 30 + j*40, bWidth - 20, 4);
        }
        city.fillStyle(0x020104, 1);
    }

    // Right Side City
    for (let i = 0; i < 15; i++) {
        const bWidth = 60 + Math.random() * 100;
        const bHeight = 150 + Math.random() * 300;
        const bx = width - (Math.random() * (width * 0.2)) - bWidth;
        city.fillRect(bx, height - bHeight, bWidth, bHeight);
        
        // Window lights
        city.fillStyle(0xfacc15, 0.2);
        for(let j=0; j<8; j++) {
            if(Math.random() > 0.6) city.fillRect(bx + 10, height - bHeight + 30 + j*40, bWidth - 20, 4);
        }
        city.fillStyle(0x020104, 1);
    }
  }

  private createAtmosphere() {
    const width = 2000;
    const height = 1200;
    const rt = this.add.renderTexture(0, 0, width, height).setScrollFactor(0).setDepth(-10);
    
    const sky = this.make.graphics({ x: 0, y: 0, add: false } as any);
    sky.fillGradientStyle(0x050208, 0x050208, 0x0a0a1a, 0x0a0a1a, 1);
    sky.fillRect(0, 0, width, height);
    rt.draw(sky);

    // Distant Cyber Glow
    this.add.pointlight(width * 0.5, 300, 0xBC00FF, 500, 0.1).setScrollFactor(0).setDepth(-9);
  }

  private createBackgroundGrid() {
    const { width, height } = this.scale;
    this.cyberGrid = this.add.graphics();
    this.cyberGrid.setDepth(-9.5);
    this.cyberGrid.setScrollFactor(0);

    const gridColor = 0x00f0ff;
    const gridAlpha = 0.15;
    
    // Draw stylized grid
    this.cyberGrid.lineStyle(1, gridColor, gridAlpha);
    
    // Vertical lines with perspective
    const verticalLines = 20;
    const spacing = width / verticalLines;
    for (let i = 0; i <= verticalLines; i++) {
        const x = i * spacing;
        this.cyberGrid.lineBetween(x, height, width / 2 + (x - width / 2) * 0.1, height * 0.3);
    }
    
    // Horizontal lines with exponential spacing for perspective
    const horizontalLines = 15;
    for (let i = 0; i < horizontalLines; i++) {
        const y = height * 0.3 + Math.pow(i / horizontalLines, 2) * (height * 0.7);
        this.cyberGrid.lineBetween(0, y, width, y);
    }

    // Pulsating animation
    this.tweens.add({
        targets: this.cyberGrid,
        alpha: { from: 0.3, to: 1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  private setupInputs() {
    this.input.keyboard?.on('keydown-LEFT', () => this.moveLane(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveLane(1));
    this.input.keyboard?.on('keydown-A', () => this.moveLane(-1));
    this.input.keyboard?.on('keydown-D', () => this.moveLane(1));
    this.input.keyboard?.on('keydown-SPACE', () => this.jump());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());

    // Swipe & Touch
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartTime = this.time.now;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const elapsed = this.time.now - this.swipeStartTime;
      const distance = pointer.x - this.swipeStartX;

      if (elapsed < 500 && Math.abs(distance) > this.minSwipeDistance) {
        if (distance > 0) this.moveLane(1);
        else this.moveLane(-1);
      } else {
        // Simple tap fallback
        if (pointer.x < this.scale.width / 2) this.moveLane(-1);
        else this.moveLane(1);
      }
    });

    // Jump fallback (Single tap top area or space)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.y < this.scale.height * 0.3) {
            this.jump();
        }
    });
  }

  private handleResize(gameSize: { width: number, height: number }) {
    const { width, height } = gameSize;
    
    // Update Road Layout
    const roadWidth = Math.min(width * 0.9, 600);
    const centerX = width / 2;

    if (this.roadGrid) {
        this.roadGrid.x = centerX;
        this.roadGrid.width = roadWidth;
        this.roadGrid.height = height;
        this.roadGrid.cellWidth = roadWidth / 3;
    }

    // Reposition Vehicle
    this.vehicle.y = height * 0.85;
    this.vehicle.x = this.getLaneX(this.currentLane);
  }

  private getLaneX(lane: number): number {
    const roadWidth = Math.min(this.scale.width * 0.9, 600);
    const centerX = this.scale.width / 2;
    const laneWidth = roadWidth / 3;
    return (centerX - laneWidth) + (lane * laneWidth);
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
    this.game.events.emit('game-paused', this.isPaused);
    if (this.isPaused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  private createTextures() {
    const userStats = this.game.registry.get('userStats');
    const skinId = userStats?.equippedSkin || 'NEURAL RUNNER';
    const skin = (SKINS as any)[skinId] || SKINS['NEURAL RUNNER'];

    // Player Cyber Car Texture - Top Down High Detail
    const carGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    
    // Base Car Shape
    carGraphics.fillStyle(skin.body, 1);
    carGraphics.fillRoundedRect(0, 0, 50, 100, 12);
    
    // Windshield
    carGraphics.fillStyle(0x0a0a0a, 0.8);
    carGraphics.fillRoundedRect(5, 15, 40, 30, 6);
    carGraphics.fillStyle(skin.glow, 0.2);
    carGraphics.fillRoundedRect(8, 18, 34, 24, 4);

    // Decorative Lines
    carGraphics.lineStyle(2, skin.glow, 1);
    carGraphics.beginPath();
    carGraphics.moveTo(5, 50);
    carGraphics.lineTo(45, 50);
    carGraphics.strokePath();

    // Headlights Glow
    carGraphics.fillStyle(skin.glow, 0.8);
    carGraphics.fillCircle(12, 5, 5);
    carGraphics.fillCircle(38, 5, 5);
    
    carGraphics.generateTexture('player-car', 50, 100);

    // Light trail
    const trailGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    trailGraphics.fillStyle(skin.glow, 0.6);
    trailGraphics.fillRect(0, 0, 4, 8);
    trailGraphics.generateTexture('light-trail', 4, 8);

    // Coin Texture - Yellow circle with $C handled in spawnItem via graphics but need base
    const coinTex = this.make.graphics({ x: 0, y: 0, add: false } as any);
    coinTex.fillStyle(0xfacc15, 1);
    coinTex.fillCircle(30, 30, 30);
    coinTex.lineStyle(2, 0xffffff, 1);
    coinTex.strokeCircle(30, 30, 27);
    coinTex.generateTexture('coin-tex', 60, 60);

    // Obstacle Texture - Red Glowing Block
    const obsGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    obsGraphics.fillStyle(0x1a0000, 1);
    obsGraphics.fillRoundedRect(0, 0, 80, 80, 8);
    obsGraphics.lineStyle(4, 0xff3e3e, 1);
    obsGraphics.strokeRoundedRect(0, 0, 80, 80, 8);
    obsGraphics.generateTexture('obstacle', 80, 80);

    // Speed Boost - Green Diamond
    const boostGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    boostGraphics.fillStyle(0x22c55e, 1);
    boostGraphics.beginPath();
    boostGraphics.moveTo(25, 0);
    boostGraphics.lineTo(50, 25);
    boostGraphics.lineTo(25, 50);
    boostGraphics.lineTo(0, 25);
    boostGraphics.closePath();
    boostGraphics.fillPath();
    boostGraphics.lineStyle(2, 0xffffff, 0.8);
    boostGraphics.strokePath();
    boostGraphics.generateTexture('boost-tex', 50, 50);
  }

  private createRoad() {
    const centerX = this.scale.width / 2;
    const roadWidth = Math.min(this.scale.width * 0.8, 500);
    
    // Asphalt surface
    this.add.rectangle(centerX, this.scale.height / 2, roadWidth, this.scale.height, 0x121212).setDepth(-5);
    
    // Side curbs
    this.add.rectangle(centerX - roadWidth/2 - 5, this.scale.height/2, 10, this.scale.height, 0x00f0ff, 0.4).setDepth(-4);
    this.add.rectangle(centerX + roadWidth/2 + 5, this.scale.height/2, 10, this.scale.height, 0xfacc15, 0.4).setDepth(-4);

    // Lane lines Group
    this.roadGroup = this.add.group();
    const laneWidth = roadWidth / 3;
    
    // Create scrolling lane markers
    for (let j = 0; j < 2; j++) {
        const lx = centerX - roadWidth/2 + (j + 1) * laneWidth;
        for (let i = 0; i < 10; i++) {
            const line = this.add.rectangle(lx, i * 200, 6, 60, 0xffffff, 0.3).setDepth(-3);
            this.roadGroup.add(line);
        }
    }
  }

  private createPlayer() {
    const userStats = this.game.registry.get('userStats');
    const skinId = userStats?.equippedSkin || 'NEURAL RUNNER';
    const skin = (SKINS as any)[skinId] || SKINS['NEURAL RUNNER'];

    const carSprite = this.add.image(0, 0, 'player-car').setScale(1.1);
    const glow = this.add.pointlight(0, 0, skin.glow, 100, 0.4);
    
    this.vehicle = this.add.container(this.getLaneX(this.currentLane), this.scale.height * 0.85, [carSprite, glow]);
    this.vehicle.setSize(48, 90);
    this.physics.world.enable(this.vehicle);
    (this.vehicle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    
    // Subtle engine vibration
    this.tweens.add({
        targets: carSprite,
        y: 1,
        duration: 50,
        yoyo: true,
        repeat: -1
    });
  }

  private moveLane(dir: number) {
    const nextLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);
    if (nextLane !== this.currentLane) {
      const prevLane = this.currentLane;
      this.currentLane = nextLane;
      
      this.tweens.add({
        targets: this.vehicle,
        x: this.getLaneX(this.currentLane),
        duration: 200,
        ease: 'Power2.easeOut',
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          const progress = tween.progress;
          const tilt = (nextLane - prevLane) * 15 * Math.sin(progress * Math.PI);
          this.vehicle.setAngle(tilt);
        },
        onComplete: () => {
          this.vehicle.setAngle(0);
        }
      });
    }
  }

  public jump() {
    if (this.isJumping || this.isPaused) return;
    this.isJumping = true;
    
    AudioService.playBoost();

    this.tweens.add({
      targets: this.vehicle.getAt(0), // carSprite
      y: -100,
      scale: 1.3,
      duration: 400,
      yoyo: true,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.isJumping = false;
        if (this.cameras && this.cameras.main) {
            this.cameras.main.shake(150, 0.008);
        }
      }
    });
  }

  private spawnObstacle() {
    const lane = Phaser.Math.Between(0, 2);
    const obstacle = this.obstacles.create(this.getLaneX(lane), -100, 'obstacle');
    obstacle.setVelocityY(this.speed);
  }

  private spawnItem() {
    // Max screen limit: 6 coins
    const activeCoins = this.items.getChildren().filter(item => item.getData('type') === 'COIN').length;
    if (activeCoins >= 6) return;

    const lane = Phaser.Math.Between(0, 2);
    const centerX = this.getLaneX(lane);
    const rand = Math.random();

    // Speed Boost Powerup (Keep intact but rare)
    if (rand > 0.95) {
      const boost = this.items.create(centerX, -100, 'boost-tex');
      boost.setData('type', 'BOOST');
      boost.setVelocityY(this.speed);
      boost.setDepth(100);
      
      this.tweens.add({
          targets: boost,
          scale: 1.2,
          alpha: 0.8,
          duration: 400,
          yoyo: true,
          repeat: -1
      });
      return;
    }

    // $C Coin System - 60px diameter
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xFFD700, 1);
    coinGraphics.fillCircle(0, 0, 30); // 60px diameter
    coinGraphics.lineStyle(3, 0xFFFFFF, 1);
    coinGraphics.strokeCircle(0, 0, 30);

    const coinText = this.add.text(0, 0, '$C', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const coinContainer = this.add.container(centerX, -50, [coinGraphics, coinText]);
    coinContainer.setDepth(100);
    coinContainer.setData('type', 'COIN');
    
    // Enable Physics
    this.physics.world.enable(coinContainer);
    const body = coinContainer.body as Phaser.Physics.Arcade.Body;
    body.setCircle(30, -30, -30); // Center the hit area

    // Movement using tween - slower as requested (4000ms)
    this.tweens.add({
      targets: coinContainer,
      y: this.scale.height + 100,
      duration: 4000,
      ease: 'Linear',
      onComplete: () => {
        coinContainer.destroy();
      }
    });

    // Spinning/Pulsing Animation
    this.tweens.add({
      targets: coinContainer,
      scale: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.items.add(coinContainer as any);
  }

  private handleObstacleCollision(car: any, obstacle: any) {
    if (this.isJumping) return;
    
    const ox = obstacle.x;
    const oy = obstacle.y;
    obstacle.destroy();
    this.health--;
    
    if (this.cameras && this.cameras.main) {
      this.cameras.main.shake(400, 0.03);
      this.cameras.main.flash(150, 255, 0, 0);
    }

    this.hitEmitter.emitParticleAt(ox, oy, 20);
    
    // Visual flash on vehicle
    const sprite = this.vehicle.getAt(0) as Phaser.GameObjects.Image;
    this.tweens.add({
        targets: sprite,
        tint: 0xff0000,
        duration: 100,
        yoyo: true,
        repeat: 3
    });

    this.game.events.emit('update-health', this.health);
    
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  private handleItemCollision(car: any, item: any) {
    const type = item.getData('type');
    
    if (type === 'COIN') {
        this.cCollected++;
        AudioService.playCollect();
        
        // Use the coinBase position for particles
        const px = item.x;
        const py = item.y;
        this.emitter.emitParticleAt(px, py, 15);
        
        const mult = this.multiplierActive ? 2 : 1;
        this.score += 10 * mult;
        
        this.game.events.emit('update-c-collected', this.cCollected);
    } else if (type === 'BOOST') {
        this.activateMultiplier();
        AudioService.playBoost();
        if (this.cameras && this.cameras.main) {
            this.cameras.main.flash(500, 34, 197, 94);
        }
    }
    
    item.destroy();
    this.game.events.emit('update-score', this.score);
  }

  private activateMultiplier() {
    this.multiplierActive = true;
    if (this.multiplierTimer) this.multiplierTimer.destroy();
    
    this.game.events.emit('update-multiplier', 2);
    
    // Visual effect on car
    const glow = this.vehicle.getAt(1) as any;
    glow.color = 0x22c55e;
    glow.intensity = 0.8;

    this.multiplierTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.multiplierActive = false;
        this.game.events.emit('update-multiplier', 1);
        glow.color = 0x00f0ff;
        glow.intensity = 0.4;
      }
    });
  }

  private gameOver() {
    this.physics.pause();
    this.isPaused = true;
    AudioService.playGameOver();
    AudioService.stopEngine();
    
    this.game.events.emit('game-over', {
        score: this.score,
        cCollected: this.cCollected,
        distance: Math.floor(this.distance),
        multiplier: this.maxMultiplier
    });
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    const scrollSpeed = (this.speed * delta) / 1000;
    this.distance += scrollSpeed / 50;
    
    const currentMult = this.multiplierActive ? 2 : 1;
    if (currentMult > this.maxMultiplier) this.maxMultiplier = currentMult;

    const limitY = this.scale.height + 100;

    // Frame-rate independent scrolling
    this.roadGroup.getChildren().forEach((line: any) => {
      line.y += scrollSpeed;
      if (line.y > limitY) line.y = -100;
    });

    // Cleanup
    this.obstacles.getChildren().forEach((obs: any) => {
      if (obs.y > limitY) obs.destroy();
    });
    this.items.getChildren().forEach((item: any) => {
      if (item.y > limitY) item.destroy();
    });

    // Update HUD
    if (this.scoreText) this.scoreText.setText(`SCORE: ${this.score}`);
    if (this.cText) this.cText.setText(`$C: ${this.cCollected}`);
    if (this.multiplierText) {
        const m = this.multiplierActive ? 2 : 1;
        this.multiplierText.setText(`${m.toFixed(1)}X`);
        this.multiplierText.setVisible(m > 1);
    }
  }
}
