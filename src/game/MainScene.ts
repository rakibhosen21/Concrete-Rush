import Phaser from 'phaser';
import { COLORS, PLAYER_CONFIG, BAG_TYPE, BAG_CONFIG } from '../constants';
import { AudioService } from './AudioService';

export default class MainScene extends Phaser.Scene {
  private car!: Phaser.GameObjects.Container;
  private roadGroup!: Phaser.GameObjects.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private bags!: Phaser.Physics.Arcade.Group;
  
  private speed = 600;
  private score = 0;
  private health = PLAYER_CONFIG.HEALTH;
  private currentLane = 1; // 0, 1, 2
  private isPaused = false;
  private multiplierActive = false;
  private multiplierTimer?: Phaser.Time.TimerEvent;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private speedLines!: Phaser.GameObjects.Particles.ParticleEmitter;
  private buildings!: Phaser.GameObjects.Group;
  private sideRails!: Phaser.GameObjects.Group;
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
    this.cameras.main.setBackgroundColor(0x1a0b2e); // Deep purple sunset base
    
    this.createAtmosphere();
    this.createBuildings();
    this.createRoad();
    this.createTextures();
    this.createPlayer();
    
    this.obstacles = this.physics.add.group();
    this.bags = this.physics.add.group();

    // Speed Lines - Improved for visibility
    this.speedLines = this.add.particles(0, 0, 'speed-line', {
      x: () => Math.random() * this.scale.width,
      y: -50,
      lifespan: 400,
      speedY: { min: 1000, max: 2500 },
      scaleY: { start: 1, end: 2 },
      scaleX: 1,
      alpha: { start: 0.2, end: 0 },
      blendMode: 'ADD',
      frequency: 80
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
    this.physics.add.overlap(this.car, this.obstacles, this.handleObstacleCollision, undefined, this);
    this.physics.add.overlap(this.car, this.bags, this.handleBagCollision, undefined, this);

    // Initial Layout Setup
    this.handleResize({ width: this.scale.width, height: this.scale.height });
  }

  private createAtmosphere() {
    // Brighter Sunset Gradient
    const width = 2000; // Large enough for resizing
    const height = 1200;
    const rt = this.add.renderTexture(0, 0, width, height).setScrollFactor(0).setDepth(-10);
    
    // Draw sky gradient
    const sky = this.make.graphics({ x: 0, y: 0, add: false } as any);
    sky.fillGradientStyle(0xff7b00, 0xff7b00, 0x7b1fa2, 0x7b1fa2, 1);
    sky.fillRect(0, 0, width, height);
    rt.draw(sky);

    // Sun
    this.add.circle(100, 100, 80, 0xffff00, 0.2).setScrollFactor(0.01).setDepth(-9).setBlendMode('ADD');
    this.add.circle(100, 100, 40, 0xffffff, 0.8).setScrollFactor(0.01).setDepth(-9);
  }

  private createBuildings() {
    this.buildings = this.add.group();
    const count = 15;
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, 1200);
        const w = Phaser.Math.Between(80, 200);
        const h = Phaser.Math.Between(200, 600);
        const building = this.add.rectangle(x, 600 - h/2, w, h, 0x0a0515, 0.9).setScrollFactor(0.05).setDepth(-8);
        
        // Add windows
        const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
        graphics.fillStyle(0xffffff, 0.4);
        for(let row=0; row<h/30; row++) {
            for(let col=0; col<w/25; col++) {
                if(Math.random() > 0.6) graphics.fillRect(10 + col*20, 20 + row*25, 10, 10);
            }
        }
        const winTex = `win-${i}`;
        graphics.generateTexture(winTex, w, h);
        const windows = this.add.image(x, 600 - h/2, winTex).setScrollFactor(0.05).setDepth(-7).setAlpha(0.5).setTint(0xffaa00);
        
        this.buildings.add(building);
        this.buildings.add(windows);
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

    // Reposition Car
    this.car.y = height * 0.85;
    this.car.x = this.getLaneX(this.currentLane);
    
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
    // Player Car Texture (Cyberpunk detailed)
    const carGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    
    // Main body shadow
    carGraphics.fillStyle(0x000000, 0.5);
    carGraphics.fillRoundedRect(4, 4, 40, 70, 8);
    
    // Main body
    carGraphics.fillStyle(0x111111);
    carGraphics.fillRoundedRect(0, 0, 40, 70, 10);
    
    // Neon Outline
    carGraphics.lineStyle(3, 0xfacc15, 1);
    carGraphics.strokeRoundedRect(0, 0, 40, 70, 10);
    
    // Energy core / stripes
    carGraphics.fillStyle(0xfacc15, 0.3);
    carGraphics.fillRect(10, 15, 20, 40);
    carGraphics.lineStyle(1, 0xfacc15, 0.5);
    carGraphics.strokeRect(10, 15, 20, 40);

    // Cockpit
    carGraphics.fillStyle(0x222222);
    carGraphics.fillRoundedRect(8, 20, 24, 25, 4);
    
    // Headlights (Glowing)
    carGraphics.fillStyle(0xffffff, 1);
    carGraphics.fillCircle(8, 8, 5);
    carGraphics.fillCircle(32, 8, 5);
    
    // Rear Thrusters
    carGraphics.fillStyle(0x3b82f6, 0.8);
    carGraphics.fillRect(5, 68, 8, 4);
    carGraphics.fillRect(27, 68, 8, 4);

    carGraphics.generateTexture('player-car', 40, 75);

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

    // Speed Line Texture
    const slGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    slGraphics.fillStyle(0xffffff, 0.3);
    slGraphics.fillRect(0, 0, 2, 60);
    slGraphics.generateTexture('speed-line', 2, 60);
  }

  private createRoad() {
    const centerX = this.scale.width / 2;
    const roadWidth = Math.min(this.scale.width * 0.9, 600);
    
    // Main road surface - Deep Asphalt with reflection hint
    const road = this.add.rectangle(centerX, 300, roadWidth, 1200, 0x0f0a1a).setDepth(-5);
    this.roads.push(road);
    
    // Road Grid
    this.roadGrid = this.add.grid(centerX, 300, roadWidth, 1200, roadWidth / 3, 100, 0, 0, 0xffffff, 0.05).setDepth(-4);
    
    // Glowing Side Rails (Brighter sunset cyan/yellow)
    this.sideRails = this.add.group();
    for (let i = 0; i < 15; i++) {
        const left = this.add.rectangle(centerX - roadWidth/2, i * 100, 6, 40, 0x00f0ff, 0.8).setDepth(1);
        const right = this.add.rectangle(centerX + roadWidth/2, i * 100, 6, 40, 0x00f0ff, 0.8).setDepth(1);
        this.sideRails.add(left);
        this.sideRails.add(right);
    }

    this.roadGroup = this.add.group();
    for (let i = 0; i < 12; i++) {
      const line1 = this.add.rectangle(centerX - roadWidth/6, i * 100, 2, 40, 0xffffff, 0.2);
      const line2 = this.add.rectangle(centerX + roadWidth/6, i * 100, 2, 40, 0xffffff, 0.2);
      this.roadGroup.add(line1);
      this.roadGroup.add(line2);
    }
  }

  private createPlayer() {
    const carContainer = this.add.container(0, 0);
    
    // Draw 3D-style car using graphics
    const carBody = this.add.graphics();
    
    // Bottom Layer (Shadow/Base)
    carBody.fillStyle(0x000000, 0.4);
    carBody.fillRoundedRect(-22, -37, 44, 74, 8);

    // Deep Body
    carBody.fillStyle(0x111111);
    carBody.fillRoundedRect(-20, -35, 40, 70, 10);
    
    // Cyan Neon Outline
    carBody.lineStyle(3, 0x00f0ff, 1);
    carBody.strokeRoundedRect(-20, -35, 40, 70, 10);
    
    // Energy Stripes (Yellow)
    carBody.fillStyle(0xfacc15, 0.4);
    carBody.fillRect(-10, -15, 20, 30);
    
    // Cockpit
    carBody.fillStyle(0x222222);
    carBody.fillRoundedRect(-12, -10, 24, 25, 4);

    carContainer.add(carBody);
    
    // Add internal engine light - Cyan for matching
    const engineGlow = this.add.pointlight(0, 30, 0x00f0ff, 80, 0.6);
    carContainer.add(engineGlow);
    
    this.car = this.add.container(this.getLaneX(this.currentLane), this.scale.height * 0.85, [carContainer]);
    this.car.setSize(40, 75);
    this.physics.world.enable(this.car);
    (this.car.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    
    // Hover animation
    this.tweens.add({
        targets: carContainer,
        y: -6,
        duration: 1200,
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
        targets: this.car,
        x: this.getLaneX(this.currentLane),
        duration: 200,
        ease: 'Cubic.easeOut',
        onUpdate: () => {
          const progress = this.tweens.getTweensOf(this.car)[0].progress;
          const tilt = (nextLane - prevLane) * 12 * Math.sin(progress * Math.PI);
          this.car.setAngle(tilt);
        },
        onComplete: () => {
          this.car.setAngle(0);
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
    const float = this.add.text(this.car.x, this.car.y - 60, "+COMBO!", {
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
    AudioService.playGameOver();
    AudioService.stopEngine();
    this.game.events.emit('game-over', this.score);
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

  update() {
    if (this.isPaused) return;

    this.drawSpeedMeter();
    const scrollSpeed = this.speed / 60;
    const limitY = this.scale.height + 100;

    // Optimized Scrolling
    this.roadGroup.getChildren().forEach((line: any) => {
      line.y += scrollSpeed;
      if (line.y > limitY) line.y = -100;
    });

    this.sideRails.getChildren().forEach((rail: any) => {
        rail.y += scrollSpeed;
        if (rail.y > limitY) rail.y = -100;
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
