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
  private isGameOver = false;
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

  private roadGraphics!: Phaser.GameObjects.Graphics;
  private roadOffset = 0;
  private horizonY = 0;
  private roadWidthTop = 40;
  private roadWidthBottom = 1200;
  private skylineLayers: Phaser.GameObjects.Graphics[] = [];
  private speedLines: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  
  private swipeStartX: number = 0;
  private swipeStartTime: number = 0;
  private minSwipeDistance = 30;

  constructor() {
    super('MainScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x050208); // Dark Cyberpunk Sky
    
    this.roadGraphics = this.add.graphics().setDepth(-10);
    this.createSkyline();
    this.createRoad();
    this.createTextures();
    this.createPlayer();
    
    // Speed lines for motion blur on sides
    const lines = this.add.particles(0, 0, 'light-trail', {
        x: { min: 0, max: this.scale.width },
        y: { min: 0, max: this.scale.height },
        speedY: { min: 400, max: 800 },
        scale: { start: 0.1, end: 1 },
        alpha: { start: 0, end: 0.2 },
        lifespan: 500,
        frequency: 50
    });
    lines.setDepth(-1);

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
    this.horizonY = height * 0.45;

    // Sky Gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x000010, 0x000010, 0x0a0a2a, 0x0a0a2a, 1);
    sky.fillRect(0, 0, width, this.horizonY);
    sky.setDepth(-20);

    // Far Buildings (Slow Parallax)
    const farLayer = this.add.graphics().setDepth(-15).setScrollFactor(0.1);
    this.drawCity(farLayer, 0x050510, 30, 100);
    this.skylineLayers.push(farLayer);

    // Near Buildings (Faster Parallax)
    const nearLayer = this.add.graphics().setDepth(-12).setScrollFactor(0.3);
    this.drawCity(nearLayer, 0x0a0a1a, 60, 250);
    this.skylineLayers.push(nearLayer);
  }

  private drawCity(g: Phaser.GameObjects.Graphics, color: number, minH: number, maxH: number) {
    const { width } = this.scale;
    g.fillStyle(color, 1);
    for (let i = 0; i < 40; i++) {
        const w = 40 + Math.random() * 80;
        const h = minH + Math.random() * (maxH - minH);
        const x = Math.random() * width;
        g.fillRect(x, this.horizonY - h, w, h);
        
        // Neon highlights
        if (Math.random() > 0.5) {
            const neonColors = [0x00f0ff, 0xbd00ff, 0xfacc15];
            g.fillStyle(neonColors[Math.floor(Math.random() * 3)], 0.3);
            g.fillRect(x + 10, this.horizonY - h + 20, w - 20, 4);
            g.fillStyle(color, 1);
        }
    }
  }

  private createRoad() {
    // Road logic is handled in update via roadGraphics
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
    const { height } = gameSize;
    this.vehicle.y = height * 0.85;
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

    // Player Cyber Car Texture - REAR VIEW Detailed
    const carGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    
    // Main Body (Rear View)
    carGraphics.fillStyle(skin.body, 1);
    carGraphics.fillRoundedRect(5, 20, 60, 40, 8); // Rear bumper area
    carGraphics.fillRoundedRect(10, 0, 50, 30, 10); // Upper cabin area
    
    // Rear Window
    carGraphics.fillStyle(0x050510, 1);
    carGraphics.fillRoundedRect(15, 5, 40, 15, 4);
    
    // Tail Lights (Glow)
    carGraphics.fillStyle(0xff0000, 1);
    carGraphics.fillRoundedRect(10, 25, 12, 6, 2);
    carGraphics.fillRoundedRect(48, 25, 12, 6, 2);
    
    // Glow accents
    carGraphics.lineStyle(2, skin.glow, 0.6);
    carGraphics.strokeRoundedRect(5, 20, 60, 40, 8);
    carGraphics.strokeRoundedRect(10, 0, 50, 30, 10);

    // License Plate
    carGraphics.fillStyle(0xfacc15, 1);
    carGraphics.fillRect(28, 48, 14, 6);

    carGraphics.generateTexture('player-car', 70, 65);

    // Light trail
    const trailGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    trailGraphics.fillStyle(skin.glow, 0.6);
    trailGraphics.fillRect(0, 0, 4, 8);
    trailGraphics.generateTexture('light-trail', 4, 8);

    // Obstacle - Rear View Car
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    enemyGraphics.fillStyle(0x1a1a1a, 1);
    enemyGraphics.fillRoundedRect(0, 10, 60, 40, 6);
    enemyGraphics.fillStyle(0x333333, 1);
    enemyGraphics.fillRoundedRect(5, 0, 50, 20, 8);
    enemyGraphics.fillStyle(0xff0000, 1); 
    enemyGraphics.fillRect(5, 20, 10, 4);
    enemyGraphics.fillRect(45, 20, 10, 4);
    enemyGraphics.generateTexture('enemy-car', 60, 50);

    // Barrier Obstacle
    const barGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    barGraphics.fillStyle(0x444444);
    barGraphics.fillRect(0, 20, 100, 30);
    barGraphics.fillStyle(0xffff00);
    for(let i=0; i<5; i++) barGraphics.fillRect(i*20, 20, 10, 30);
    barGraphics.generateTexture('barrier', 100, 50);

    // Coin Texture
    const coinTex = this.make.graphics({ x: 0, y: 0, add: false } as any);
    coinTex.fillStyle(0xfacc15, 1);
    coinTex.fillCircle(30, 30, 30);
    coinTex.lineStyle(3, 0xffffff, 0.5);
    coinTex.strokeCircle(30, 30, 27);
    coinTex.generateTexture('coin-tex', 60, 60);

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
    if (this.isGameOver || this.isPaused) return;
    const lane = Phaser.Math.Between(0, 2);
    const type = Math.random() > 0.5 ? 'enemy-car' : 'barrier';
    const obs = this.obstacles.create(0, 0, type);
    obs.setData('z', 0.01);
    obs.setData('lane', lane);
  }

  private spawnItem() {
    if (this.isGameOver || this.isPaused) return;
    const lane = Phaser.Math.Between(0, 2);
    const type = Math.random() > 0.1 ? 'coin-tex' : 'boost-tex';
    const item = this.items.create(0, 0, type);
    item.setData('z', 0.01);
    item.setData('lane', lane);
    item.setData('type', type === 'coin-tex' ? 'COIN' : 'BOOST');
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
    this.isGameOver = true;
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

  private drawPseudo3DRoad() {
    const g = this.roadGraphics;
    const { width, height } = this.scale;
    const centerX = width / 2;
    
    g.clear();
    
    // Draw Main Asphalt (Trapezoid)
    g.fillStyle(0x1a1a1a, 1);
    g.beginPath();
    g.moveTo(centerX - this.roadWidthTop / 2, this.horizonY);
    g.lineTo(centerX + this.roadWidthTop / 2, this.horizonY);
    g.lineTo(centerX + this.roadWidthBottom / 2, height);
    g.lineTo(centerX - this.roadWidthBottom / 2, height);
    g.closePath();
    g.fillPath();

    // Road Edges (Rumble strips)
    this.drawRoadLines(g, centerX, 0.48, 0.52, true);

    // Lane Lines
    this.drawRoadLines(g, centerX, 0.15, 0.17, false);
    this.drawRoadLines(g, centerX, -0.15, -0.17, false);
  }

  private drawRoadLines(g: Phaser.GameObjects.Graphics, centerX: number, leftRel: number, rightRel: number, isEdge: boolean) {
    const segments = 12;
    const { height } = this.scale;

    for (let i = 0; i < segments; i++) {
        const z1 = (i * 100 + (this.roadOffset % 100)) / 1000;
        const z2 = z1 + 0.05;
        
        if (z1 > 1) continue;

        const getY = (z: number) => this.horizonY + (height - this.horizonY) * z;
        const getX = (z: number, rel: number) => centerX + (this.roadWidthBottom * z * rel);

        const y1 = getY(z1);
        const y2 = getY(z2);

        if (y1 < this.horizonY) continue;

        g.fillStyle(isEdge ? (Math.floor(z1 * 10) % 2 === 0 ? 0xffffff : 0xff0000) : 0xffffff, isEdge ? 1 : 0.4);
        g.beginPath();
        g.moveTo(getX(z1, leftRel), y1);
        g.lineTo(getX(z1, rightRel), y1);
        g.lineTo(getX(z2, rightRel), y2);
        g.lineTo(getX(z2, leftRel), y2);
        g.closePath();
        g.fillPath();
    }
  }

  private updateObjectsPerspective(delta: number) {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const speedMod = (this.multiplierActive ? 2.5 : 1) * (1 + (this.score / 2000));
    const zStep = 0.0004 * delta * speedMod;

    [...this.obstacles.getChildren(), ...this.items.getChildren()].forEach((obj: any) => {
        let z = obj.getData('z') || 0;
        z += zStep;
        obj.setData('z', z);

        const targetY = this.horizonY + (height - this.horizonY) * z;
        const screenX = centerX + ((obj.getData('lane') - 1) * (this.roadWidthBottom * 0.3 * z));
        
        obj.x = screenX;
        obj.y = targetY;
        obj.setScale(z * 2);
        obj.setDepth(targetY);

        if (z > 1.1) {
          obj.destroy();
        }
    });
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    const speedMod = (this.multiplierActive ? 2.5 : 1) * (1 + (this.score / 2000));
    const scrollAmount = this.speed * speedMod * delta / 1000;
    
    this.roadOffset += scrollAmount;
    this.distance += scrollAmount / 50;
    
    const currentMult = this.multiplierActive ? 2 : 1;
    if (currentMult > this.maxMultiplier) this.maxMultiplier = currentMult;

    this.drawPseudo3DRoad();

    // Player and Parallax
    const targetX = (this.scale.width / 2) + ((this.currentLane - 1) * (this.roadWidthBottom * 0.3 * 0.85)); // 0.85 is player Z approx
    this.vehicle.x = Phaser.Math.Linear(this.vehicle.x, targetX, 0.1);
    
    const sprite = this.vehicle.getAt(0) as Phaser.GameObjects.Image;
    if (this.currentLane === 0) sprite.setAngle(Phaser.Math.Linear(sprite.angle, -5, 0.1));
    else if (this.currentLane === 2) sprite.setAngle(Phaser.Math.Linear(sprite.angle, 5, 0.1));
    else sprite.setAngle(Phaser.Math.Linear(sprite.angle, 0, 0.1));

    this.skylineLayers.forEach((layer, i) => {
        layer.x = (this.scale.width / 2 - this.vehicle.x) * (0.05 * (i + 1));
    });

    this.updateObjectsPerspective(delta);

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
