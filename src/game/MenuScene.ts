import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    private bike!: Phaser.GameObjects.Container;
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

        // moving road lines - Subdued
        this.roadGroup = this.add.group();
        for (let i = 0; i < 10; i++) {
            const line = this.add.rectangle(centerX, i * 100, 2, 40, 0xffffff, 0.1);
            this.roadGroup.add(line);
        }

        // Subdued Cinematic Atmosphere
        this.add.particles(centerX, height * 0.82, 'bag-YELLOW', {
            speedX: { min: -10, max: 10 },
            speedY: 80,
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 1000,
            frequency: 200,
            blendMode: 'ADD'
        });

        // 3D-ish Bike Primitive
        this.createBike(centerX, height * 0.8);

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
        
        // Glowing windows - crisp dots
        const g = this.add.graphics();
        for(let r=0; r<h/20; r++) {
            for(let c=0; c<w/15; c++) {
                if(Math.random() > 0.8) {
                    const colors = [0xffffff, 0xfacc15, 0x00f0ff];
                    g.fillStyle(colors[Math.floor(Math.random()*colors.length)], 0.5);
                    g.fillRect(x - w/2 + 8 + c*12, y - h/2 + 12 + r*20, 3, 3);
                }
            }
        }
        this.buildings.add(b);
    }

    private createBike(x: number, y: number) {
        const bikeContainer = this.add.container(x, y);

        // Headlight beam - Subtle
        const beam = this.add.graphics();
        beam.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 0.1, 0.1, 0, 0);
        beam.fillTriangle(-15, -120, 0, -30, 15, -120);

        const body = this.add.graphics();
        
        // Shadow under bike for depth
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(0, 45, 30, 20);

        // Chassis - Dark & Sharp
        body.fillStyle(0x0a0a0a);
        body.fillRoundedRect(-12, -40, 24, 80, 10);
        
        // Rim highlight
        body.lineStyle(1, 0x00f0ff, 0.2);
        body.strokeRoundedRect(-12, -40, 24, 80, 10);

        // Mechanical detail
        body.lineStyle(1, 0x222222, 1);
        body.lineBetween(0, -30, 0, 30);

        // Neon Accents - Defined
        body.fillStyle(0xfacc15, 0.8);
        body.fillRect(-10, -15, 2, 30);
        body.fillRect(8, -15, 2, 30);

        // Cockpit
        body.fillStyle(0x1a1a1a);
        body.fillRoundedRect(-8, -35, 16, 25, 6);
        
        // Engine Glow - Balanced
        const glow = this.add.pointlight(0, 10, 0x00f0ff, 50, 0.3);
        
        bikeContainer.add([shadow, beam, body, glow]);
        this.bike = bikeContainer;
        
        // Idle animation
        this.tweens.add({
            targets: this.bike,
            y: y - 3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time: number, delta: number) {
        const scrollSpeed = (this.speed * delta) / 1000;
        const parallaxSpeed = (0.5 * delta) / 16.67; // Approx original speed

        // Road scroll
        this.roadGroup.getChildren().forEach((line: any) => {
            line.y += scrollSpeed;
            if (line.y > this.scale.height + 50) line.y = -50;
        });

        // Building scroll (parallax)
        this.buildings.getChildren().forEach((b: any) => {
             b.y += parallaxSpeed;
             if (b.y > this.scale.height + 200) b.y = -200;
        });
    }
}
