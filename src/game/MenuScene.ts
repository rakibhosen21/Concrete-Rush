import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    private car!: Phaser.GameObjects.Container;
    private roadGroup!: Phaser.GameObjects.Group;
    private buildings!: Phaser.GameObjects.Group;
    private speed = 400;

    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const roadWidth = width * 0.7;
        
        // Background
        this.add.rectangle(centerX, height/2, width, height, 0x050208);
        
        // Atmosphere Gradient
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x7b1fa2, 0x7b1fa2, 0x050208, 0x050208, 1);
        sky.fillRect(0, 0, width, height);

        // Moving Light Rays
        for (let i = 0; i < 5; i++) {
            const ray = this.add.rectangle(Phaser.Math.Between(0, width), height/2, 2, height * 2, 0xffffff, 0.05);
            ray.setAngle(Phaser.Math.Between(-20, 20));
            this.tweens.add({
                targets: ray,
                alpha: 0.1,
                x: ray.x + 100,
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1
            });
        }
        
        // Sun/Glow
        this.add.circle(width * 0.8, height * 0.2, 100, 0xff7b00, 0.1).setBlendMode('ADD');
        
        // Parallax Buildings - Constrained to sides
        this.buildings = this.add.group();
        const sideWidth = (width - roadWidth) / 2;
        for (let i = 0; i < 15; i++) {
            // Left side
            this.createBuilding(Phaser.Math.Between(0, sideWidth), Phaser.Math.Between(0, height));
            // Right side
            this.createBuilding(Phaser.Math.Between(width - sideWidth, width), Phaser.Math.Between(0, height));
        }

        // Road
        this.add.rectangle(centerX, height/2, roadWidth, height, 0x0a0a0a);
        
        // Road Grid
        this.add.grid(centerX, height/2, roadWidth, height, roadWidth/3, 80, 0, 0, 0x00f0ff, 0.1);

        // Animated Lane Lines
        this.roadGroup = this.add.group();
        for (let i = 0; i < 10; i++) {
            const line = this.add.rectangle(centerX, i * 100, 2, 40, 0xffffff, 0.2);
            this.roadGroup.add(line);
        }

        // 3D-ish Car Primitive
        this.createCar(centerX, height * 0.8);

        // Subtle Particles
        this.add.particles(centerX, height * 0.82, 'bag-YELLOW', {
            speedX: { min: -20, max: 20 },
            speedY: 100,
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 1000,
            frequency: 100,
            blendMode: 'ADD'
        });

        // Floating Pixel Particles for ambiance
        const pixels = this.add.graphics();
        pixels.fillStyle(0x00f0ff, 0.5);
        pixels.fillRect(0, 0, 4, 4);
        pixels.generateTexture('pixel-p', 4, 4);
        
        this.add.particles(0, 0, 'pixel-p', {
            x: { min: 0, max: width },
            y: height + 20,
            lifespan: { min: 4000, max: 8000 },
            speedY: { min: -30, max: -80 },
            scale: { start: 0.5, end: 1 },
            alpha: { start: 0.2, end: 0 },
            frequency: 200,
            blendMode: 'ADD'
        });
    }

    private createBuilding(x: number, y: number) {
        const w = Phaser.Math.Between(60, 120);
        const h = Phaser.Math.Between(150, 400);
        const b = this.add.rectangle(x, y, w, h, 0x050208, 0.8);
        
        // Glowing windows
        const g = this.add.graphics();
        g.fillStyle(0x00f0ff, 0.4);
        for(let r=0; r<h/30; r++) {
            for(let c=0; c<w/20; c++) {
                if(Math.random() > 0.7) g.fillRect(x - w/2 + 10 + c*15, y - h/2 + 10 + r*25, 6, 6);
            }
        }
        this.buildings.add(b);
    }

    private createCar(x: number, y: number) {
        const carBody = this.add.graphics();
        
        // Shadow
        carBody.fillStyle(0x000000, 0.4);
        carBody.fillRoundedRect(-22, -37, 44, 74, 8);

        // Body Layers (simulating 3D)
        // Bottom layer
        carBody.fillStyle(0x111111);
        carBody.fillRoundedRect(-20, -35, 40, 70, 10);
        
        // Mid layer (depth)
        carBody.fillStyle(0x222222);
        carBody.fillRoundedRect(-18, -32, 36, 60, 8);
        
        // Top highlight
        carBody.fillStyle(0x333333);
        carBody.fillRoundedRect(-14, -28, 28, 40, 6);

        // Neon Accents
        carBody.lineStyle(2, 0x00f0ff, 1);
        carBody.strokeRoundedRect(-20, -35, 40, 70, 10);
        
        // Engine Glow
        const glow = this.add.pointlight(0, 30, 0x00f0ff, 60, 0.5);
        
        this.car = this.add.container(x, y, [carBody, glow]);
        
        // Idle animation
        this.tweens.add({
            targets: this.car,
            y: y - 4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update() {
        // Road scroll
        this.roadGroup.getChildren().forEach((line: any) => {
            line.y += this.speed / 60;
            if (line.y > this.scale.height + 50) line.y = -50;
        });

        // Building scroll (parallax)
        this.buildings.getChildren().forEach((b: any) => {
             b.y += 0.5;
             if (b.y > this.scale.height + 200) b.y = -200;
        });
    }
}
