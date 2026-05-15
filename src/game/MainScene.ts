import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../constants';
import { AudioService } from './AudioService';

const SKINS = {
  'NEURAL RUNNER': { body: 0x333333, glow: 0x00f0ff },
  'CYBER PHANTOM': { body: 0x4a0082, glow: 0xff00ff },
  'GOLDEN CIRCUIT': { body: 0xffd700, glow: 0xffffff },
  'VOID STALKER': { body: 0x111111, glow: 0xff0000 },
  'CONCRETE KING': { body: 0xffffff, glow: 0xffff00 },
  'NEON GHOST': { body: 0x00ffff, glow: 0xffffff },
  'INFERNO RUNNER': { body: 0x8b0000, glow: 0xff6600 },
  'ARCTIC WOLF': { body: 0xf0f8ff, glow: 0x00bfff },
  'SHADOW BLADE': { body: 0x006400, glow: 0x32cd32 },
  'TOXIC RACER': { body: 0x32cd32, glow: 0x000000 },
  'CHROME DEMON': { body: 0xc0c0c0, glow: 0xff0000 },
  'CONCRETE LEGEND': { body: 0x000000, glow: 0xffd700 }
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

  preload() {
    // coin-tex: yellow circle with $C text
    const coinCanvas = this.textures.createCanvas('coin-tex', 60, 60);
    const coinCtx = coinCanvas.getContext();
    coinCtx.fillStyle = '#FFD700';
    coinCtx.beginPath();
    coinCtx.arc(30, 30, 28, 0, Math.PI * 2);
    coinCtx.fill();
    coinCtx.strokeStyle = '#FFF';
    coinCtx.lineWidth = 2;
    coinCtx.stroke();
    coinCtx.fillStyle = '#000';
    coinCtx.font = 'bold 14px monospace';
    coinCtx.textAlign = 'center';
    coinCtx.textBaseline = 'middle';
    coinCtx.fillText('$C', 30, 30);
    coinCanvas.refresh();

    // light-trail: small white dot
    const trailCanvas = this.textures.createCanvas('light-trail', 8, 8);
    const trailCtx = trailCanvas.getContext();
    trailCtx.fillStyle = '#ffffff';
    trailCtx.beginPath();
    trailCtx.arc(4, 4, 4, 0, Math.PI * 2);
    trailCtx.fill();
    trailCanvas.refresh();

    // boost-tex: green diamond
    const boostCanvas = this.textures.createCanvas('boost-tex', 40, 40);
    const boostCtx = boostCanvas.getContext();
    boostCtx.fillStyle = '#00ff88';
    boostCtx.beginPath();
    boostCtx.moveTo(20, 0);
    boostCtx.lineTo(40, 20);
    boostCtx.lineTo(20, 40);
    boostCtx.lineTo(0, 20);
    boostCtx.closePath();
    boostCtx.fill();
    boostCanvas.refresh();

    // Generate Car Textures for all skins
    Object.entries(SKINS).forEach(([id, config]) => {
        const carCanvas = this.textures.createCanvas(`car-${id}`, 48, 90);
        const carCtx = carCanvas.getContext();
        const bodyHex = '#' + config.body.toString(16).padStart(6, '0');
        const glowHex = '#' + config.glow.toString(16).padStart(6, '0');

        // Car body
        carCtx.fillStyle = bodyHex;
        if (typeof carCtx.roundRect === 'function') {
            carCtx.roundRect(4, 8, 40, 74, 8);
        } else {
            carCtx.rect(4, 8, 40, 74);
        }
        carCtx.fill();

        // Specific decals based on skin
        if (id === 'GOLDEN CIRCUIT') {
            carCtx.strokeStyle = '#ffffff';
            carCtx.lineWidth = 1;
            carCtx.beginPath();
            for(let i=10; i<80; i+=20) {
                carCtx.moveTo(4, i);
                carCtx.lineTo(44, i+10);
            }
            carCtx.stroke();
        } else if (id === 'VOID STALKER') {
            carCtx.fillStyle = '#ff0000';
            carCtx.fillRect(10, 40, 28, 2);
            carCtx.fillRect(10, 50, 28, 2);
        } else if (id === 'CONCRETE KING') {
            const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
            colors.forEach((c, i) => {
                carCtx.fillStyle = c;
                carCtx.fillRect(4 + (i * 5.7), 8, 5.7, 74);
            });
            carCtx.fillStyle = bodyHex;
            carCtx.fillRect(10, 15, 28, 60);
        } else if (id === 'NEON GHOST') {
            carCtx.strokeStyle = '#ffffff';
            carCtx.lineWidth = 2;
            carCtx.strokeRect(6, 10, 36, 70);
        } else if (id === 'INFERNO RUNNER') {
            carCtx.fillStyle = '#ff6600';
            carCtx.beginPath();
            carCtx.moveTo(4, 80);
            carCtx.lineTo(10, 50);
            carCtx.lineTo(24, 70);
            carCtx.lineTo(38, 50);
            carCtx.lineTo(44, 80);
            carCtx.fill();
        } else if (id === 'ARCTIC WOLF') {
            carCtx.fillStyle = '#00bfff';
            carCtx.globalAlpha = 0.3;
            for(let i=0; i<10; i++) {
                carCtx.fillRect(Math.random()*40, Math.random()*80, 5, 5);
            }
            carCtx.globalAlpha = 1.0;
        } else if (id === 'TOXIC RACER') {
            carCtx.fillStyle = '#000000';
            carCtx.beginPath();
            carCtx.arc(24, 45, 10, 0, Math.PI*2);
            carCtx.fill();
            carCtx.strokeStyle = '#32cd32';
            carCtx.stroke();
        } else if (id === 'CHROME DEMON') {
            carCtx.fillStyle = '#ff0000';
            carCtx.beginPath();
            carCtx.moveTo(4, 8); carCtx.lineTo(0, 0); carCtx.lineTo(10, 8);
            carCtx.moveTo(44, 8); carCtx.lineTo(48, 0); carCtx.lineTo(38, 8);
            carCtx.fill();
        }

        // BRANDING: "CONCRETE" text
        carCtx.fillStyle = (id === 'GOLDEN CIRCUIT' || id === 'TOXIC RACER') ? '#000000' : '#ffffff';
        if (id === 'INFERNO RUNNER') carCtx.fillStyle = '#ff6600';
        if (id === 'ARCTIC WOLF') carCtx.fillStyle = '#00bfff';
        if (id === 'CONCRETE LEGEND') carCtx.fillStyle = '#ffd700';
        
        carCtx.font = id === 'CONCRETE LEGEND' ? 'bold 10px Arial' : '8px monospace';
        carCtx.textAlign = 'center';
        
        if (id === 'CONCRETE LEGEND') {
            carCtx.fillText('CONCRETE', 24, 25);
            carCtx.fillText('LEGEND', 24, 35);
        } else if (id === 'CONCRETE KING') {
             carCtx.fillStyle = '#ffd700';
             carCtx.fillText('CONCRETE', 24, 15);
        } else if (id === 'SHADOW BLADE') {
            carCtx.font = 'bold 8px Courier';
            carCtx.fillText('CONCRETE', 24, 45);
        } else {
            carCtx.fillText('CONCRETE', 24, 45);
        }

        // Windshield
        carCtx.fillStyle = '#00f0ff';
        carCtx.globalAlpha = 0.6;
        carCtx.fillRect(10, 15, 28, 20);
        carCtx.globalAlpha = 1.0;

        // Tail lights
        carCtx.fillStyle = '#ff0000';
        carCtx.fillRect(6, 75, 12, 8);
        carCtx.fillRect(30, 75, 12, 8);
        
        carCanvas.refresh();
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#87CEEB'); // Day Sky Blue
    
    this.roadGraphics = this.add.graphics().setDepth(-10);
    this.createSkyline();
    this.createRoad(); // Ensures road is drawn immediately
    this.drawPseudo3DRoad(); // Initial draw
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
    this.time.addEvent({ delay: 1500, callback: this.spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 1000, callback: this.spawnItem, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 10000, callback: () => { this.speed = Math.min(this.speed + 80, 2000); }, loop: true });

    // Inputs
    this.setupInputs();
    
    const moveHandler = (dir: number) => {
        if (!this || !this.sys || !this.sys.isActive()) return;
        this.moveLane(dir);
    };
    const resumeHandler = () => {
        if (!this || !this.sys || !this.sys.isActive()) return;
        if (this.isPaused) this.togglePause();
    };

    this.game.events.on('move-car', moveHandler);
    this.game.events.on('resume-game', resumeHandler);

    this.events.once('shutdown', () => {
        if (this.game && this.game.events) {
            this.game.events.off('move-car', moveHandler);
            this.game.events.off('resume-game', resumeHandler);
        }
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
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xB0E0FF, 0xB0E0FF, 1);
    sky.fillRect(0, 0, width, this.horizonY);
    sky.setDepth(-20);

    // Sun
    const sunGlow = this.add.pointlight(width - 120, 100, 0xffff00, 250, 0.6);
    const sun = this.add.circle(width - 120, 100, 45, 0xffeb3b);
    sun.setDepth(-19);
    sunGlow.setDepth(-19);

    // Clouds
    for(let i=0; i<8; i++) {
        const cx = Math.random() * width;
        const cy = 50 + Math.random() * 150;
        const cloud = this.add.circle(cx, cy, 20 + Math.random() * 30, 0xffffff, 0.4);
        cloud.setDepth(-18);
    }

    // Far Buildings (Slow Parallax)
    const farLayer = this.add.graphics().setDepth(-15).setScrollFactor(0.1);
    this.drawCity(farLayer, 0x666666, 40, 120);
    this.skylineLayers.push(farLayer);

    // Near Buildings (Faster Parallax)
    const nearLayer = this.add.graphics().setDepth(-12).setScrollFactor(0.3);
    this.drawCity(nearLayer, 0x8B7355, 80, 280);
    this.skylineLayers.push(nearLayer);
  }

  private drawCity(g: Phaser.GameObjects.Graphics, color: number, minH: number, maxH: number) {
    const { width } = this.scale;
    g.fillStyle(color, 1);
    for (let i = 0; i < 20; i++) {
        const w = 70 + Math.random() * 110;
        const h = minH + Math.random() * (maxH - minH);
        const x = Math.random() * width;
        g.fillRect(x, this.horizonY - h, w, h);
        
        // Windows
        g.fillStyle(0xfff7d1, 0.7);
        for(let py = 25; py < h - 15; py += 35) {
            for(let px = 15; px < w - 15; px += 25) {
                if(Math.random() > 0.4) g.fillRect(x + px, this.horizonY - h + py, 12, 18);
            }
        }
        g.fillStyle(color, 1);
    }
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
      if (!this || !this.sys || !this.sys.isActive()) return;
      this.swipeStartX = pointer.x;
      if (this.time) this.swipeStartTime = this.time.now;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this || !this.sys || !this.sys.isActive() || !this.time) return;
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
        if (!this || !this.sys || !this.sys.isActive()) return;
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
    if (!this || !this.sys || !this.sys.isActive()) return;
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

    // Player Cyber Car Texture - Top-Down Lamborghini Style
    const carGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    
    const drawLambo = (g: Phaser.GameObjects.Graphics, bodyColor: number, isPlayer: boolean) => {
        // Main Body - Sleek Top-Down
        g.fillStyle(bodyColor, 1);
        
        // Body base (angular)
        g.beginPath();
        g.moveTo(25, 0);   // Nose
        g.lineTo(45, 15);  // Front Right
        g.lineTo(50, 75);  // Rear Right
        g.lineTo(40, 95);  // Bottom Right
        g.lineTo(10, 95);  // Bottom Left
        g.lineTo(0, 75);   // Rear Left
        g.lineTo(5, 15);   // Front Left
        g.closePath();
        g.fillPath();

        // Windshield (Angular)
        g.fillStyle(0x0a0a0a, 0.9);
        g.beginPath();
        g.moveTo(25, 25);
        g.lineTo(40, 35);
        g.lineTo(38, 55);
        g.lineTo(12, 55);
        g.lineTo(10, 35);
        g.closePath();
        g.fillPath();

        // Side Mirrors
        g.fillStyle(bodyColor, 1);
        g.fillRect(-2, 35, 6, 4);
        g.fillRect(46, 35, 6, 4);

        // Hood Lines
        g.lineStyle(2, 0x000000, 0.3);
        g.beginPath();
        g.moveTo(25, 5);
        g.lineTo(25, 20);
        g.strokePath();

        // Rear Tail Lights (RED)
        g.fillStyle(0xff0000, 1);
        g.fillRect(5, 90, 8, 4);
        g.fillRect(37, 90, 8, 4);

        // Front Headlights (SMALL CYAN DOTS)
        g.fillStyle(0x00f0ff, 1);
        g.fillCircle(12, 18, 2);
        g.fillCircle(38, 18, 2);
    };

    drawLambo(carGraphics, skin.body, true);
    carGraphics.generateTexture('player-car', 50, 95);

    // Enemy Car Textures
    const enemyColors = [0xef4444, 0x3b82f6, 0xffffff, 0x94a3b8, 0xf97316];
    enemyColors.forEach((color, idx) => {
        const eg = this.make.graphics({ x: 0, y: 0, add: false } as any);
        drawLambo(eg, color, false);
        eg.generateTexture(`enemy-car-${idx}`, 50, 95);
    });

    // Obstacle - Rear View Car
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    drawLambo(enemyGraphics, 0x1a1a1a, false);
    enemyGraphics.generateTexture('enemy-car', 50, 95);

    // Barrier Obstacle
    const barGraphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    barGraphics.fillStyle(0x444444);
    barGraphics.fillRect(0, 20, 100, 30);
    barGraphics.fillStyle(0xffff00);
    for(let i=0; i<5; i++) barGraphics.fillRect(i*20, 20, 10, 30);
    barGraphics.generateTexture('barrier', 100, 50);
  }

  private createRoad() {
    // Road logic is handled in update via roadGraphics
  }

  private createPlayer() {
    const userStats = this.game.registry.get('userStats');
    const skinId = userStats?.equippedSkin || 'NEURAL RUNNER';
    const skin = (SKINS as any)[skinId] || SKINS['NEURAL RUNNER'];

    const carSprite = this.add.image(0, 0, `car-${skinId}`).setScale(1.1);
    const glow = this.add.pointlight(0, 0, skin.glow, 80, 0.2); // Reduced intensity for visibility
    
    this.vehicle = this.add.container(this.getLaneX(this.currentLane), this.scale.height * 0.85, [glow, carSprite]);
    this.vehicle.setSize(48, 90);
    this.vehicle.setDepth(50);
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
    if (!this || !this.sys || !this.sys.isActive() || this.isGameOver || this.isPaused) return;
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
    if (!this || !this.sys || !this.sys.isActive() || this.isJumping || this.isPaused) return;
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
    if (!this || !this.sys || !this.sys.isActive() || this.isGameOver || this.isPaused) return;
    const lane = Phaser.Math.Between(0, 2);
    
    // Choose between a barrier or a traffic car
    let type = 'barrier';
    if (Math.random() > 0.4) {
        type = `enemy-car-${Phaser.Math.Between(0, 4)}`;
    }
    
    const obs = this.obstacles.create(0, 0, type);
    obs.setData('z', 0.01);
    obs.setData('lane', lane);
  }

  private spawnItem() {
    if (!this || !this.sys || !this.sys.isActive() || this.isGameOver || this.isPaused) return;
    const lane = Phaser.Math.Between(0, 2);
    const type = Math.random() > 0.1 ? 'coin-tex' : 'boost-tex';
    const item = this.items.create(0, 0, type);
    item.setData('z', 0.01);
    item.setData('lane', lane);
    item.setData('type', type === 'coin-tex' ? 'COIN' : 'BOOST');
  }

  private handleObstacleCollision(car: any, obstacle: any) {
    if (!this || !this.sys || !this.sys.isActive() || this.isJumping) return;
    
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
    if (!this || !this.sys || !this.sys.isActive()) return;
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
    AudioService.stopGameBGM(); // Stop game BGM on death
    
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
    
    // Draw Main Asphalt (Trapezoid) - Light Grey
    const roadWFactor = 0.65; // 65% width
    const currentRoadWidthBottom = width * roadWFactor;
    const currentRoadWidthTop = this.roadWidthTop;

    g.fillStyle(0x888888, 1);
    g.beginPath();
    g.moveTo(centerX - currentRoadWidthTop / 2, this.horizonY);
    g.lineTo(centerX + currentRoadWidthTop / 2, this.horizonY);
    g.lineTo(centerX + currentRoadWidthBottom / 2, height);
    g.lineTo(centerX - currentRoadWidthBottom / 2, height);
    g.closePath();
    g.fillPath();

    // Road Edges (Rumble strips)
    this.drawRoadLines(g, centerX, currentRoadWidthBottom, 0.48, 0.52, true);

    // Lane Lines (White Dashed)
    this.drawRoadLines(g, centerX, currentRoadWidthBottom, 0.15, 0.17, false);
    this.drawRoadLines(g, centerX, currentRoadWidthBottom, -0.15, -0.17, false);
  }

  private drawRoadLines(g: Phaser.GameObjects.Graphics, centerX: number, roadWidth: number, leftRel: number, rightRel: number, isEdge: boolean) {
    const segments = 12;
    const { height } = this.scale;

    for (let i = 0; i < segments; i++) {
        const z1 = (i * 100 + (this.roadOffset % 100)) / 1000;
        const z2 = z1 + 0.05;
        
        if (z1 > 1) continue;

        const getY = (z: number) => this.horizonY + (height - this.horizonY) * z;
        const getX = (z: number, rel: number) => centerX + (roadWidth * z * rel);

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
    if (!this || !this.sys || !this.sys.isActive()) return;
    const { width, height } = this.scale;
    const centerX = width / 2;
    const speedMod = (this.multiplierActive ? 2.5 : 1) * (1 + (this.score / 2000));
    const zStep = 0.0004 * delta * speedMod;
    const roadWidth = width * 0.65;

    [...this.obstacles.getChildren(), ...this.items.getChildren()].forEach((obj: any) => {
        let z = obj.getData('z') || 0;
        z += zStep;
        obj.setData('z', z);

        const targetY = this.horizonY + (height - this.horizonY) * z;
        const screenX = centerX + ((obj.getData('lane') - 1) * (roadWidth * 0.3 * z));
        
        obj.x = screenX;
        obj.y = targetY;
        obj.setScale(z * 2);
        
        // Coins at 40, Obstacles at 45 (just below car at 50)
        const baseDepth = obj.texture.key === 'coin-tex' ? 40 : 45;
        obj.setDepth(baseDepth + z);

        if (z > 1.1) {
          obj.destroy();
        }
    });
  }

  update(time: number, delta: number) {
    if (!this || !this.sys || !this.sys.isActive() || this.isPaused) return;

    const speedMod = (this.multiplierActive ? 2.5 : 1) * (1 + (this.score / 2000));
    const scrollAmount = this.speed * speedMod * delta / 1000;
    
    this.roadOffset += scrollAmount;
    this.distance += scrollAmount / 50;
    
    const currentMult = this.multiplierActive ? 2 : 1;
    if (currentMult > this.maxMultiplier) this.maxMultiplier = currentMult;

    this.drawPseudo3DRoad();

    // Player and Parallax
    const roadWidth = this.scale.width * 0.65;
    const targetX = (this.scale.width / 2) + ((this.currentLane - 1) * (roadWidth * 0.3 * 0.85)); // 0.85 is player Z approx
    this.vehicle.x = Phaser.Math.Linear(this.vehicle.x, targetX, 0.1);
    
    const sprite = this.vehicle.getAt(0) as Phaser.GameObjects.Image;
    if (this.currentLane === 0) sprite.setAngle(Phaser.Math.Linear(sprite.angle, -5, 0.1));
    else if (this.currentLane === 2) sprite.setAngle(Phaser.Math.Linear(sprite.angle, 5, 0.1));
    else sprite.setAngle(Phaser.Math.Linear(sprite.angle, 0, 0.1));

    this.skylineLayers.forEach((layer, i) => {
        layer.x = (this.scale.width / 2 - this.vehicle.x) * (0.05 * (i + 1));
    });

    this.updateObjectsPerspective(delta);

    // Rainbow Exhaust for CONCRETE LEGEND
    if (this.trailEmitter) {
        const userStats = this.game.registry.get('userStats');
        if (userStats?.equippedSkin === 'CONCRETE LEGEND') {
            const colors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0xee82ee];
            const color = colors[Math.floor(time / 100) % colors.length];
            this.trailEmitter.setParticleTint(color);
        } else {
            const skin = (SKINS as any)[userStats?.equippedSkin || 'NEURAL RUNNER'] || SKINS['NEURAL RUNNER'];
            this.trailEmitter.setParticleTint(skin.glow);
        }
    }

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
