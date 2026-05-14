import Phaser from 'phaser';
import { COLORS, PLAYER_CONFIG, BAG_TYPE, BAG_CONFIG } from '../constants';
import { AudioService } from './AudioService';

export default class MainScene extends Phaser.Scene {
  private vehicle!: Phaser.GameObjects.Container;
  private roadGroup!: Phaser.GameObjects.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private bags!: Phaser.Physics.Arcade.Group;
  
  private speed = 600;
  private score = 0;
  private distance = 0;
  private health = PLAYER_CONFIG.HEALTH;
  private maxMultiplier = 1;

  private currentLane = 1; // 0, 1, 2
  private isPaused = false;
  private multiplierActive = false;
  private multiplierTimer?: Phaser.Time.TimerEvent;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private speedLines!: Phaser.GameObjects.Particles.ParticleEmitter;
  private trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sceneryGroup!: Phaser.GameObjects.Group;
  private clouds!: Phaser.GameObjects.Group;
  private roadGrid!: Phaser.GameObjects.Grid;
  private speedMeter!: Phaser.GameObjects.Graphics;
  private roads: Phaser.GameObjects.Rectangle[] = [];
  private combo = 0;
  private maxCombo = 0;
  private bagsInRow = 0;
  
  private swipeStartX: number = 0;
  private swipeStartTime: number = 0;
  private minSwipeDistance = 30;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Generate textures
  }

  create() {
    this.cameras.main.setBackgroundColor(0x87ceeb); // Sky blue base
    
    this.createAtmosphere();
    this.createScenery();
    this.createRoad();
    this.createTextures();
    this.createPlayer();
    
    this.obstacles = this.physics.add.group();
    this.bags = this.physics.add.group();

    // Cinematic Camera Setup
    this.cameras.main.setLerp(0.1, 0.1);
    this.cameras.main.zoom = 1.05;

    // Light Trails for the bike - more subtle
    this.trailEmitter = this.add.particles(0, 0, 'light-trail', {
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.2, end: 0 },
      lifespan: 200,
      blendMode: 'ADD',
      frequency: 30,
      follow: this.vehicle,
      followOffset: { x: 0, y: 30 }
    }).setDepth(5);

    // Speed Lines - Subdued for cinematic focus
    this.speedLines = this.add.particles(0, 0, 'speed-line', {
      x: () => Math.random() * this.scale.width,
      y: -50,
      lifespan: 400,
      speedY: { min: 800, max: 2000 },
      scaleY: { start: 0.5, end: 1.5 },
      scaleX: 0.4,
      alpha: { start: 0.05, end: 0 },
      blendMode: 'ADD',
      frequency: 250
    });

    // Particle Emitter for collections
    this.emitter = this.add.particles(0, 0, 'bag-YELLOW', {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      lifespan: 600,
      emitting: false
    });

    // Spawn events
    this.time.addEvent({ delay: 1500, callback: this.spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1000, callback: this.spawnBag, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 10000, callback: () => { this.speed = Math.min(this.speed + 100, 2500); }, loop: true });

    // Inputs
    this.setupInputs();
    this.game.events.on('move-car', (dir: number) => this.moveLane(dir));

    // Speed Meter
    this.speedMeter = this.add.graphics();
    this.speedMeter.setDepth(100);

    // Audio
    AudioService.startEngine();

    // Collision
    this.physics.add.overlap(this.vehicle, this.obstacles, this.handleObstacleCollision, undefined, this);
    this.physics.add.overlap(this.vehicle, this.bags, this.handleBagCollision, undefined, this);

    // Initial Layout Setup
    this.handleResize({ width: this.scale.width, height: this.scale.height });
  }

  private createAtmosphere() {
    // Cinematic Sky Gradient (Professional Blue to soft Horizon)
    const width = 2000;
    const height = 1200;
    const rt = this.add.renderTexture(0, 0, width, height).setScrollFactor(0).setDepth(-10);
    
    const sky = this.make.graphics({ x: 0, y: 0, add: false } as any);
    // Gradient from deep sky blue to light sapphire
    sky.fillGradientStyle(0x1a4a6e, 0x1a4a6e, 0x4a90e2, 0x4a90e2, 1);
    sky.fillRect(0, 0, width, height);
    rt.draw(sky);

    // Cinematic Sun Glow (Distanced and soft)
    const sunGlow = this.add.pointlight(width * 0.15, 120, 0xffe5b4, 350, 0.25).setScrollFactor(0.01).setDepth(-9);
    const sun = this.add.circle(width * 0.15, 120, 35, 0xffffff, 0.95).setScrollFactor(0.01).setDepth(-9);
    
    // Horizon Fog / Distance Blur
    const horizonFog = this.add.graphics();
    horizonFog.fillGradientStyle(0x4a90e2, 0x4a90e2, 0x000000, 0x000000, 0.4, 0.4, 0, 0).setDepth(-6).setScrollFactor(0);
    horizonFog.fillRect(0, 0, width, 400);

    this.tweens.add({
        targets: [sun, sunGlow],
        y: 115,
        duration: 5000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Substrate Ambient Day Clouds
    this.clouds = this.add.group();
    for(let i=0; i<8; i++) {
        const cx = Math.random() * 2000;
        const cy = 50 + Math.random() * 200;
        const cloud = this.add.image(cx, cy, 'cloud').setScrollFactor(0.02).setDepth(-8).setAlpha(0.2).setScale(0.8 + Math.random());
        this.clouds.add(cloud);
    }
  }

  private createScenery() {
    this.sceneryGroup = this.add.group();
    const count = 24;
    for (let i = 0; i < count; i++) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const roadWidth = 600;
        const x = (this.scale.width / 2) + (side * (roadWidth/2 + 120 + Math.random() * 500));
        const y = Math.random() * this.scale.height;
        
        const type = Math.random() > 0.7 ? 'tree-large' : 'tree-small';
        const tree = this.add.image(x, y, type).setDepth(-7).setScale(1.2 + Math.random() * 0.5);
        tree.setData('speed', 0.15 + Math.random() * 0.25);
        this.sceneryGroup.add(tree);
        
        if (Math.random() > 0.4) {
            const grass = this.add.image(x + (Math.random()-0.5)*80, y + (Math.random()-0.5)*80, 'grass').setDepth(-8).setScale(0.7 + Math.random()*0.8);
            grass.setData('speed', tree.getData('speed'));
            this.sceneryGroup.add(grass);
        }
    }
  }

  private setupInputs() {
    this.input.keyboard?.on('keydown-LEFT', () => this.moveLane(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveLane(1));
    this.input.keyboard?.on('keydown-A', () => this.moveLane(-1));
    this.input.keyboard?.on('keydown-D', () => this.moveLane(1));
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
  }

  private handleResize(gameSize: { width: number, height: number }) {
    const { width, height } = gameSize;
    
    // Update Road Layout
    const roadWidth = Math.min(width * 0.9, 600);
    const centerX = width / 2;
    
    this.roads.forEach(r => {
        r.x = centerX;
        r.width = roadWidth;
        r.height = height;
    });

    if (this.roadGrid) {
        this.roadGrid.x = centerX;
        this.roadGrid.width = roadWidth;
        this.roadGrid.height = height;
        this.roadGrid.cellWidth = roadWidth / 3;
    }

    // Reposition Vehicle
    this.vehicle.y = height * 0.82;
    this.vehicle.x = this.getLaneX(this.currentLane);
    
    // Update Speed Lines Area
    this.speedLines.setPosition(0, 0);
  }

  private getLaneX(lane: number): number {
    const roadWidth = Math.min(this.scale.width * 0.9, 600);
    const centerX = this.scale.width / 2;
    const laneWidth = roadWidth / 3;
    return (centerX - laneWidth) + (lane * laneWidth);
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  private createTextures() {
    // Player Cyber Bike Texture
    const bikeGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    
    // Bike Shadow (Procedural texture for sharp contrast)
    const shadowGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    shadowGraphics.fillStyle(0x000000, 0.4);
    shadowGraphics.fillEllipse(15, 60, 30, 20);
    shadowGraphics.generateTexture('bike-shadow', 30, 80);

    // Main Chassis - Darker, sharper base
    bikeGraphics.fillStyle(0x0a0a0a);
    bikeGraphics.fillRoundedRect(0, 0, 24, 80, 12);
    
    // Rim Lighting - Subtle blue edge highlight for separation
    bikeGraphics.lineStyle(1, 0x00f0ff, 0.3);
    bikeGraphics.strokeRoundedRect(0, 0, 24, 80, 12);

    // Mechanical Depth Lines
    bikeGraphics.lineStyle(1, 0x222222, 1);
    bikeGraphics.lineBetween(12, 10, 12, 70);
    bikeGraphics.strokeRect(4, 30, 16, 20);

    // Accent LEDs - Sharper, less glowy
    bikeGraphics.fillStyle(0xfacc15, 0.9);
    bikeGraphics.fillRect(2, 25, 2, 30); // Left 
    bikeGraphics.fillRect(20, 25, 2, 30); // Right

    // Engine Core - Reduced brightness
    bikeGraphics.fillStyle(0x00f0ff, 0.4);
    bikeGraphics.fillCircle(12, 50, 6);
    
    // Front Shield / Cockpit - Slightly translucent
    bikeGraphics.fillStyle(0x1a1a1a, 0.95);
    bikeGraphics.fillRoundedRect(4, 5, 16, 25, 8);
    
    // Headlight - Clean white
    bikeGraphics.fillStyle(0xffffff, 1);
    bikeGraphics.fillCircle(12, 6, 3);

    bikeGraphics.generateTexture('player-bike', 24, 80);

    // Light Trail Particle Texture
    const trailGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    trailGraphics.fillStyle(0x00f0ff, 0.8);
    trailGraphics.fillRect(0, 0, 4, 4);
    trailGraphics.generateTexture('light-trail', 4, 4);

    // Obstacle Texture (Cyber Truck / Tanker)
    const obstacleGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    obstacleGraphics.fillStyle(0x1a1a1a);
    obstacleGraphics.fillRoundedRect(0, 0, 50, 60, 4);
    obstacleGraphics.lineStyle(2, 0xef4444);
    obstacleGraphics.strokeRoundedRect(0, 0, 50, 60, 4);
    
    // Warning patterns
    obstacleGraphics.fillStyle(0xef4444, 0.4);
    for(let i=0; i<3; i++) {
      obstacleGraphics.fillRect(10, 10 + i*15, 30, 5);
    }
    
    obstacleGraphics.generateTexture('obstacle', 50, 60);

    // Bag Textures
    Object.entries(BAG_CONFIG).forEach(([type, config]) => {
      const bagGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
      const color = parseInt(config.color.replace('#', '0x'));
      
      // Outer glow circle
      bagGraphics.fillStyle(color, 0.2);
      bagGraphics.fillCircle(20, 20, 20);
      
      // Middle ring
      bagGraphics.lineStyle(2, color, 0.6);
      bagGraphics.strokeCircle(20, 20, 12);
      
      // Inner glowing core
      bagGraphics.fillStyle(color, 1);
      bagGraphics.fillCircle(20, 20, 6);
      
      bagGraphics.generateTexture(`bag-${type}`, 40, 40);
    });

    // Speed Line Texture - Golden Sunlight Streaks
    const slGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    slGraphics.fillStyle(0xffd700, 0.15);
    slGraphics.fillRect(0, 0, 2, 60);
    slGraphics.generateTexture('speed-line', 2, 60);

    // Nature Textures
    const natureGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    
    // Cloud
    natureGraphics.clear();
    natureGraphics.fillStyle(0xffffff, 0.8);
    natureGraphics.fillCircle(20, 20, 20);
    natureGraphics.fillCircle(40, 25, 25);
    natureGraphics.fillCircle(65, 20, 20);
    natureGraphics.generateTexture('cloud', 85, 50);

    // Tree Large
    natureGraphics.clear();
    natureGraphics.fillStyle(0x3e2723); // trunk
    natureGraphics.fillRect(8, 20, 6, 20);
    natureGraphics.fillStyle(0x1b5e20); // main leaves
    natureGraphics.fillTriangle(11, 0, 0, 25, 22, 25);
    natureGraphics.fillStyle(0x2e7d32); // mid layer
    natureGraphics.fillTriangle(11, 8, 2, 28, 20, 28);
    natureGraphics.generateTexture('tree-large', 22, 45);

    // Tree Small
    natureGraphics.clear();
    natureGraphics.fillStyle(0x2e7d32);
    natureGraphics.fillCircle(12, 10, 12);
    natureGraphics.fillStyle(0x3e2723);
    natureGraphics.fillRect(10, 18, 4, 12);
    natureGraphics.generateTexture('tree-small', 24, 30);

    // Grass
    natureGraphics.clear();
    natureGraphics.fillStyle(0x2e7d32, 0.8);
    natureGraphics.fillRect(0, 10, 18, 2);
    natureGraphics.fillRect(2, 2, 2, 10);
    natureGraphics.fillRect(8, 0, 2, 12);
    natureGraphics.fillRect(14, 4, 2, 8);
    natureGraphics.generateTexture('grass', 18, 12);
  }

  private createRoad() {
    const centerX = this.scale.width / 2;
    const roadWidth = Math.min(this.scale.width * 0.9, 600);
    
    // Road Terrain (Dark ground)
    this.add.rectangle(centerX, 300, 3000, 1200, 0x050505).setDepth(-10);

    // Main road surface - Deep Charcoal reflective asphalt
    const road = this.add.rectangle(centerX, 300, roadWidth, 1200, 0x121212).setDepth(-5);
    this.roads.push(road);
    
    // Road Grid - Cinematic sapphire tint
    this.roadGrid = this.add.grid(centerX, 300, roadWidth, 1200, roadWidth / 3, 100, 0, 0, 0x4a90e2, 0.05).setDepth(-4);
    
    // Modern Highway Barriers
    for (let side of [-1, 1]) {
        const x = centerX + (side * roadWidth / 2);
        const barrier = this.add.graphics();
        barrier.fillStyle(0x222222, 1);
        barrier.fillRect(x - 5, 0, 10, 1200);
        barrier.lineStyle(2, 0x333333, 1);
        barrier.strokeRect(x - 5, 0, 10, 1200);
        // Periodic supports
        for(let j=0; j<12; j++) {
            barrier.fillStyle(0x000000, 0.4);
            barrier.fillRect(x-8, j*100, 16, 20);
        }
        barrier.setDepth(-3);
    }

    this.roadGroup = this.add.group();
    for (let i = 0; i < 20; i++) {
      const line1 = this.add.rectangle(centerX - roadWidth/6, i * 60, 4, 35, 0xffffff, 0.25);
      const line2 = this.add.rectangle(centerX + roadWidth/6, i * 60, 4, 35, 0xffffff, 0.25);
      this.roadGroup.add(line1);
      this.roadGroup.add(line2);
    }
  }

  private createPlayer() {
    const bikeContainer = this.add.container(0, 0);
    
    // Main beam - Lower alpha for clarity
    const beam = this.add.graphics();
    beam.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0.15, 0.15, 0, 0);
    beam.fillTriangle(-20, -150, 0, -30, 20, -150);
    
    // Shadow under bike
    const shadow = this.add.image(0, 10, 'bike-shadow').setAlpha(0.5);

    // Bike Visuals
    const bikeSprite = this.add.image(0, 0, 'player-bike').setScale(1.3);
    
    // Rim highlight (Extra sharp layer)
    const accents = this.add.graphics();
    accents.lineStyle(1.5, 0x00f0ff, 0.25);
    accents.strokeRoundedRect(-15, -50, 30, 100, 14);
    
    // Engine Glow - Balanced
    const glow = this.add.pointlight(0, 10, 0x00f0ff, 70, 0.3);
    this.tweens.add({
        targets: glow,
        intensity: 0.15,
        radius: 50,
        duration: 1000,
        yoyo: true,
        repeat: -1
    });

    bikeContainer.add([beam, shadow, bikeSprite, accents, glow]);
    
    this.vehicle = this.add.container(this.getLaneX(this.currentLane), this.scale.height * 0.82, [bikeContainer]);
    this.vehicle.setSize(40, 100);
    this.physics.world.enable(this.vehicle);
    (this.vehicle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    
    // Floating motion
    this.tweens.add({
        targets: bikeContainer,
        y: -4,
        x: { from: -1.5, to: 1.5 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  private updateSpeedLines() {
    const frequency = Math.max(10, 100 - (this.speed / 20));
    this.speedLines.setFrequency(frequency);
  }

  private moveLane(dir: number) {
    const nextLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);
    if (nextLane !== this.currentLane) {
      const prevLane = this.currentLane;
      this.currentLane = nextLane;
      
      this.tweens.add({
        targets: this.vehicle,
        x: this.getLaneX(this.currentLane),
        duration: 250,
        ease: 'Cubic.easeOut',
        onUpdate: () => {
          const progress = this.tweens.getTweensOf(this.vehicle)[0].progress;
          // Smooth leaning animation for bike
          const tilt = (nextLane - prevLane) * 15 * Math.sin(progress * Math.PI);
          this.vehicle.setAngle(tilt);
          // Subtle squash and stretch for juice
          this.vehicle.setScale(1 - Math.abs(tilt) * 0.01, 1 + Math.abs(tilt) * 0.01);
        },
        onComplete: () => {
          this.vehicle.setAngle(0);
          this.vehicle.setScale(1);
        }
      });
    }
  }

  private spawnObstacle() {
    const lane = Phaser.Math.Between(0, 2);
    const obstacle = this.obstacles.create(this.getLaneX(lane), -100, 'obstacle');
    obstacle.setVelocityY(this.speed);
    
    this.tweens.add({
        targets: obstacle,
        alpha: { from: 0.9, to: 1 },
        duration: 150,
        yoyo: true,
        repeat: -1
    });
  }

  private spawnBag() {
    const lane = Phaser.Math.Between(0, 2);
    const types = Object.values(BAG_TYPE);
    const type = types[Phaser.Math.Between(0, types.length - 1)];
    const bag = this.bags.create(this.getLaneX(lane), -100, `bag-${type}`);
    bag.setData('type', type);
    bag.setVelocityY(this.speed);
    
    this.tweens.add({
        targets: bag,
        scale: 1.2,
        duration: 400,
        yoyo: true,
        repeat: -1
    });
  }

  private handleObstacleCollision(car: any, obstacle: any) {
    obstacle.destroy();
    this.health--;
    this.combo = 0;
    this.bagsInRow = 0;
    if (this.cameras && this.cameras.main) {
      this.cameras.main.shake(300, 0.02);
      this.cameras.main.flash(100, 255, 0, 0);
    }
    this.game.events.emit('update-health', this.health);
    
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  private handleBagCollision(car: any, bag: any) {
    const type = bag.getData('type') as BAG_TYPE;
    const config = BAG_CONFIG[type];
    
    this.combo++;
    this.bagsInRow++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Handle 3-bag combo
    let comboMultiplier = 1;
    if (this.bagsInRow >= 3) {
      comboMultiplier = 2;
      this.showComboFloat();
      this.bagsInRow = 0; // Reset after bonus
    }

    AudioService.playCollect();

    // Emit particles
    this.emitter.setConfig({
      texture: `bag-${type}`
    });
    this.emitter.emitParticleAt(bag.x, bag.y, 20);

    // Score popup text
    const popup = this.add.text(bag.x, bag.y, (type === BAG_TYPE.RED ? config.score.toString() : `+${config.score}`), {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      fontStyle: 'italic black',
      color: config.color,
      align: 'center'
    }).setOrigin(0.5).setStroke('#000', 6);

    this.tweens.add({
      targets: popup,
      y: popup.y - 100,
      alpha: 0,
      duration: 600,
      ease: 'Power2.easeOut',
      onComplete: () => popup.destroy()
    });

    if (type === BAG_TYPE.RED) {
      this.score = Math.max(0, this.score + config.score);
      if (this.cameras && this.cameras.main) {
        this.cameras.main.shake(150, 0.008);
      }
    } else if (type === BAG_TYPE.PURPLE) {
      this.activateMultiplier();
      if (this.cameras && this.cameras.main) {
        this.cameras.main.flash(300, 188, 0, 255);
      }
    } else if (type === BAG_TYPE.BLUE) {
      AudioService.playBoost();
      this.speed = Math.min(this.speed + 400, 1800);
      if (this.cameras && this.cameras.main) {
        this.cameras.main.zoomTo(1.08, 400, 'Cubic.easeOut');
      }
      this.time.delayedCall(3000, () => { 
        if (this.cameras && this.cameras.main) {
          this.speed = Math.max(600, this.speed - 400);
          this.cameras.main.zoomTo(1.0, 600, 'Cubic.easeIn');
        }
      });
    } else {
      let activeMultiplier = this.multiplierActive ? 2 : 1;
      this.score += Math.floor(config.score * activeMultiplier * comboMultiplier);
    }

    bag.destroy();
    this.game.events.emit('update-score', this.score);
    this.game.events.emit('update-multiplier', this.multiplierActive ? 2 : 1);
  }

  private showComboFloat() {
    const float = this.add.text(this.vehicle.x, this.vehicle.y - 60, "+COMBO!", {
        fontFamily: 'Inter, sans-serif',
        fontSize: '32px',
        color: '#facc15',
        fontStyle: '900 italic'
    }).setOrigin(0.5).setStroke('#000', 8);

    this.tweens.add({
        targets: float,
        y: float.y - 150,
        alpha: 0,
        scale: 1.5,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => float.destroy()
    });
  }

  private activateMultiplier() {
    this.multiplierActive = true;
    if (this.multiplierTimer) this.multiplierTimer.destroy();
    this.multiplierTimer = this.time.delayedCall(5000, () => {
      this.multiplierActive = false;
    });
  }

  private gameOver() {
    this.physics.pause();
    this.isPaused = true;
    AudioService.playGameOver();
    AudioService.stopEngine();
    
    this.game.events.emit('game-over', {
        score: this.score,
        distance: Math.floor(this.distance),
        multiplier: this.maxMultiplier
    });
  }

  shutdown() {
    AudioService.stopEngine();
    this.game.events.off('update-score');
    this.game.events.off('update-health');
    this.game.events.off('update-multiplier');
    this.game.events.off('game-over');
    if (this.multiplierTimer) this.multiplierTimer.destroy();
  }

  private drawSpeedMeter() {
    const { width, height } = this.scale;
    const meterWidth = width * 0.4;
    const meterHeight = 4;
    const x = (width - meterWidth) / 2;
    const y = height - 10;

    this.speedMeter.clear();
    
    // Background
    this.speedMeter.fillStyle(0x000000, 0.4);
    this.speedMeter.fillRoundedRect(x, y, meterWidth, meterHeight, 2);

    // Fill
    const progress = Math.min(1, (this.speed - 600) / 1900);
    const fillWidth = meterWidth * progress;
    
    let color = 0x22c55e; // Green
    if (progress > 0.4) color = 0xeab308; // Yellow
    if (progress > 0.8) color = 0xef4444; // Red

    this.speedMeter.fillStyle(color, 1);
    this.speedMeter.fillRoundedRect(x, y, fillWidth, meterHeight, 2);
    this.speedMeter.lineStyle(1, 0xffffff, 0.2);
    this.speedMeter.strokeRoundedRect(x, y, meterWidth, meterHeight, 2);
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    this.drawSpeedMeter();
    const scrollSpeed = (this.speed * delta) / 1000;
    this.distance += scrollSpeed / 50; // Arbitrary scaling for distance meters
    
    const currentMult = this.multiplierActive ? 2 : 1;
    if (currentMult > this.maxMultiplier) this.maxMultiplier = currentMult;

    const limitY = this.scale.height + 100;

    // Frame-rate independent scrolling for perfect smoothness
    this.roadGroup.getChildren().forEach((line: any) => {
      line.y += scrollSpeed;
      if (line.y > limitY) line.y = -100;
    });

    // Parallax Nature Scrolling
    this.sceneryGroup.getChildren().forEach((item: any) => {
        const pSpeed = scrollSpeed * item.getData('speed');
        item.y += pSpeed;
        if (item.y > limitY) {
            item.y = -200;
            const roadWidth = 600;
            item.x = (this.scale.width / 2) + ((Math.random() > 0.5 ? 1 : -1) * (roadWidth / 2 + 100 + Math.random() * 400));
        }
    });

    // Cloud Drift
    this.clouds.getChildren().forEach((cloud: any) => {
        cloud.x += 0.2;
        if(cloud.x > 2000) cloud.x = -100;
    });

    // Cleanup
    this.obstacles.getChildren().forEach((obs: any) => {
      if (obs.y > limitY) obs.destroy();
    });
    this.bags.getChildren().forEach((bag: any) => {
      if (bag.y > limitY) bag.destroy();
    });

    this.updateSpeedLines();
  }
}
