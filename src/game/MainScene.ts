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
  private health = PLAYER_CONFIG.HEALTH;
  private currentLane = 1; // 0, 1, 2
  private isPaused = false;
  private isJumping = false;
  private multiplierActive = false;
  private currentMultiplier = 1;
  private multiplierTimer?: Phaser.Time.TimerEvent;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private speedLines!: Phaser.GameObjects.Particles.ParticleEmitter;
  private buildings!: Phaser.GameObjects.Group;
  private sideRails!: Phaser.GameObjects.Group;
  private roadGrid!: Phaser.GameObjects.Grid;
  private speedMeter!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private speedLabel!: Phaser.GameObjects.Text;
  private healthIcons: Phaser.GameObjects.Rectangle[] = [];
  private roads: Phaser.GameObjects.Rectangle[] = [];
  private comboCount = 0;
  private maxCombo = 0;
  
  private swipeStartX: number = 0;
  private swipeStartTime: number = 0;
  private swipeTracking = false;
  private minSwipeDistance = 30;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Generate textures
  }

  create() {
    this.speed = 600;
    this.score = 0;
    this.health = PLAYER_CONFIG.HEALTH;
    this.currentLane = 1;
    this.isPaused = false;
    this.isJumping = false;
    this.multiplierActive = false;
    this.currentMultiplier = 1;
    this.comboCount = 0;
    this.maxCombo = 0;

    this.cameras.main.setBackgroundColor(0x1a0b2e); // Deep purple sunset base
    
    this.createAtmosphere();
    this.createBuildings();
    this.createRoad();
    this.createTextures();
    this.createPlayer();
    this.createHUD();
    
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
    this.speedMeter = this.add.graphics().setScrollFactor(0).setDepth(200);

    // Audio
    AudioService.startEngine();

    // Collision
    this.physics.add.overlap(this.vehicle, this.obstacles, this.handleObstacleCollision, undefined, this);
    this.physics.add.overlap(this.vehicle, this.bags, this.handleBagCollision, undefined, this);

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

    // Swipe, touch, and jump input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const jumpZone = this.scale.height * 0.3;
      if (pointer.y < jumpZone) {
        this.jump();
        this.swipeTracking = false;
        return;
      }

      this.swipeTracking = true;
      this.swipeStartX = pointer.x;
      this.swipeStartTime = this.time.now;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.swipeTracking) {
        this.swipeStartTime = 0;
        return;
      }

      const elapsed = this.time.now - this.swipeStartTime;
      const distance = pointer.x - this.swipeStartX;
      this.swipeTracking = false;

      if (elapsed < 500 && Math.abs(distance) > this.minSwipeDistance) {
        if (distance > 0) this.moveLane(1);
        else this.moveLane(-1);
      } else {
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
    this.vehicle.y = height * 0.85;
    this.vehicle.x = this.getLaneX(this.currentLane);

    if (this.speedLabel) {
      this.speedLabel.setPosition(width - 40, 40);
    }

    this.healthIcons.forEach((icon, index) => {
      icon.setPosition(20 + index * 24, height - 30);
    });

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

  private jump() {
    if (this.isPaused || this.isJumping) {
      return;
    }

    this.isJumping = true;
    this.tweens.add({
      targets: this.vehicle,
      y: this.vehicle.y - 120,
      duration: 220,
      ease: 'Power2.easeOut',
      yoyo: true,
      onComplete: () => {
        this.isJumping = false;
      }
    });
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
    const glow = this.add.pointlight(0, 0, 0x00f0ff, 90, 0.5);
    const carSprite = this.add.image(0, 0, 'player-car');

    this.vehicle = this.add.container(this.getLaneX(this.currentLane), this.scale.height * 0.85, [glow, carSprite]);
    this.vehicle.setSize(40, 75);
    this.physics.world.enable(this.vehicle);
    (this.vehicle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.tweens.add({
        targets: carSprite,
        y: -6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  private createHUD() {
    const { width, height } = this.scale;
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontFamily: 'Courier, monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(200);

    const bestScore = this.getRegistryBestScore() || 0;
    this.bestScoreText = this.add.text(20, 48, `BEST: ${bestScore.toLocaleString()}`, {
      fontFamily: 'Courier, monospace',
      fontSize: '16px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(200);

    this.comboText = this.add.text(width / 2, height * 0.35, '', {
      fontFamily: 'Courier, monospace',
      fontSize: '32px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const iconY = height - 30;
    for (let i = 0; i < PLAYER_CONFIG.HEALTH; i++) {
      const icon = this.add.rectangle(20 + i * 24, iconY, 18, 18, 0xef4444).setScrollFactor(0).setDepth(200);
      this.healthIcons.push(icon);
    }

    this.speedMeter = this.add.graphics().setScrollFactor(0).setDepth(200);
    this.speedLabel = this.add.text(width - 40, 40, 'SPD', {
      fontFamily: 'Courier, monospace',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(200);

    this.updateHealthDisplay();
    this.updateScoreDisplay();
  }

  private getRegistryBestScore(): number {
    const userStats = this.game.registry.get('userStats') as { bestScore?: number } | null;
    if (userStats?.bestScore != null && userStats.bestScore > 0) {
      return userStats.bestScore;
    }
    return 0;
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
        duration: 200,
        ease: 'Cubic.easeOut',
        onUpdate: () => {
          const progress = this.tweens.getTweensOf(this.vehicle)[0].progress;
          const tilt = (nextLane - prevLane) * 12 * Math.sin(progress * Math.PI);
          this.vehicle.setAngle(tilt);
        },
        onComplete: () => {
          this.vehicle.setAngle(0);
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
    if (this.isJumping) {
      return;
    }

    obstacle.destroy();
    this.health--;
    this.updateHealthDisplay();
    this.comboCount = 0;
    this.resetComboDisplay();
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

    this.comboCount++;
    if (this.comboCount > this.maxCombo) this.maxCombo = this.comboCount;

    if (this.comboCount % 3 === 0) {
      this.showComboFloat('COMBO x3!');
    }

    let comboBonus = 0;
    if (this.comboCount % 5 === 0) {
      comboBonus = 50;
      this.showComboFloat('BONUS +50!');
    }

    AudioService.playCollect();

    this.emitter.setConfig({
      texture: `bag-${type}`
    });
    this.emitter.emitParticleAt(bag.x, bag.y, 20);

    const popupText = type === BAG_TYPE.RED ? config.score.toString() : `+${config.score}`;
    const popup = this.add.text(bag.x, bag.y, popupText, {
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
      this.score = Math.max(0, this.score + config.score + comboBonus);
      if (this.cameras && this.cameras.main) {
        this.cameras.main.shake(150, 0.008);
      }
    } else if (type === BAG_TYPE.PURPLE) {
      this.activateMultiplier();
      this.score += comboBonus;
      if (this.cameras && this.cameras.main) {
        this.cameras.main.flash(300, 188, 0, 255);
      }
    } else if (type === BAG_TYPE.BLUE) {
      AudioService.playBoost();
      this.speed = Math.min(this.speed + 400, 1800);
      this.score += comboBonus;
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
      this.score += Math.floor(config.score * this.currentMultiplier) + comboBonus;
    }

    bag.destroy();
    this.updateScoreDisplay();
    this.game.events.emit('update-score', this.score);
    this.game.events.emit('update-multiplier', this.currentMultiplier);
  }

  private showComboFloat(message: string) {
    if (this.comboText) {
      this.comboText.setText(message).setAlpha(1).setScale(1);
      this.tweens.add({
        targets: this.comboText,
        y: this.comboText.y - 80,
        alpha: 0,
        scale: 1.6,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => this.resetComboDisplay()
      });
      return;
    }

    const float = this.add.text(this.vehicle.x, this.vehicle.y - 60, message, {
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

  private resetComboDisplay() {
    if (this.comboText) {
      this.comboText.setAlpha(0);
      this.comboText.setText('');
    }
  }

  private updateScoreDisplay() {
    if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.score.toLocaleString()}`);
    }
    this.updateBestScoreDisplay();
  }

  private updateBestScoreDisplay() {
    const registryStats = this.game.registry.get('userStats') as { bestScore?: number } | null;
    const savedBest = registryStats?.bestScore;
    const displayBest = (savedBest != null && savedBest > 0) ? Math.max(savedBest, this.score) : this.score;
    if (this.bestScoreText) {
      this.bestScoreText.setText(`BEST: ${displayBest.toLocaleString()}`);
    }
  }

  private updateHealthDisplay() {
    this.healthIcons.forEach((icon, index) => {
      icon.fillColor = index < this.health ? 0xef4444 : 0x333333;
      icon.setAlpha(index < this.health ? 1 : 0.35);
    });
  }

  private activateMultiplier() {
    this.multiplierActive = true;
    this.currentMultiplier = 2;
    if (this.multiplierTimer) this.multiplierTimer.destroy();
    this.multiplierTimer = this.time.delayedCall(5000, () => {
      this.multiplierActive = false;
      this.currentMultiplier = 1;
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
    const barHeight = Math.min(height * 0.45, 260);
    const x = width - 34;
    const y = 70;

    this.speedMeter.clear();
    this.speedMeter.fillStyle(0x000000, 0.35);
    this.speedMeter.fillRoundedRect(x, y, 20, barHeight, 10);

    const progress = Phaser.Math.Clamp((this.speed - 600) / 1400, 0, 1);
    const fillHeight = barHeight * progress;

    let color = 0x00f0ff;
    if (progress > 0.4) color = 0xfacc15;
    if (progress > 0.8) color = 0xef4444;

    this.speedMeter.fillStyle(color, 1);
    this.speedMeter.fillRoundedRect(x, y + barHeight - fillHeight, 20, fillHeight, 10);
    this.speedMeter.lineStyle(1, 0xffffff, 0.18);
    this.speedMeter.strokeRoundedRect(x, y, 20, barHeight, 10);
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
