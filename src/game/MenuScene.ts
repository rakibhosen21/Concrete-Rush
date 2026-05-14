import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    private bike!: Phaser.GameObjects.Container;
    private roadGroup!: Phaser.GameObjects.Group;
    private scenery!: Phaser.GameObjects.Group;
    private clouds!: Phaser.GameObjects.Group;
    private speed = 400;

    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const roadWidth = width * 0.7;
        
        // Cinematic Sky Gradient (Professional Blue)
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x1a4a6e, 0x1a4a6e, 0x4a90e2, 0x4a90e2, 1);
        sky.fillRect(0, 0, width, height);

        // Distanced Sun
        this.add.circle(width * 0.85, height * 0.15, 30, 0xffffff, 0.9).setBlendMode('ADD');
        this.add.pointlight(width * 0.85, height * 0.15, 0xffe5b4, 250, 0.2);

        // Horizon Fog
        const horizon = this.add.graphics();
        horizon.fillGradientStyle(0x4a90e2, 0x4a90e2, 0x000000, 0x000000, 0.3, 0.3, 0, 0);
        horizon.fillRect(0, 0, width, height * 0.4);
        
        // Day Clouds
        this.clouds = this.add.group();
        for(let i=0; i<4; i++) {
            const cloud = this.add.circle(Math.random()*width, Math.random()*height*0.3, 30 + Math.random()*20, 0xffffff, 0.1);
            this.clouds.add(cloud);
        }
        
        // Nature Scenery
        this.scenery = this.add.group();
        for (let i = 0; i < 20; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = centerX + (side * (roadWidth/2 + 80 + Math.random() * 200));
            const y = Math.random() * height;
            this.createNature(x, y);
        }

        // Road - Charcoal Asphalt
        this.add.rectangle(centerX, height/2, roadWidth, height, 0x121212);
        
        // Road Grid - Sapphire reflective grain
        this.add.grid(centerX, height/2, roadWidth, height, roadWidth/3, 80, 0, 0, 0x4a90e2, 0.08);

        // modern barriers
        for (let side of [-1, 1]) {
            const x = centerX + (side * roadWidth / 2);
            const barrier = this.add.graphics();
            barrier.fillStyle(0x222222, 1);
            barrier.fillRect(x - 4, 0, 8, height);
            barrier.lineStyle(1, 0x333333, 1);
            barrier.strokeRect(x - 4, 0, 8, height);
        }

        // moving road lines
        this.roadGroup = this.add.group();
        for (let i = 0; i < 10; i++) {
            const line = this.add.rectangle(centerX, i * 100, 3, 45, 0xffffff, 0.15);
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

    private createNature(x: number, y: number) {
        const type = Math.random();
        const g = this.add.graphics();
        
        if (type > 0.6) {
            // Refined Tree silhouette
            g.fillStyle(0x3e2723); // trunk
            g.fillRect(x - 2, y + 10, 4, 12);
            g.fillStyle(0x1b5e20); // main leaves
            g.fillTriangle(x, y - 25, x - 18, y + 10, x + 18, y + 10);
            g.fillStyle(0x2e7d32); // accent
            g.fillTriangle(x, y - 15, x - 12, y + 12, x + 12, y + 12);
        } else {
            // Bush
            g.fillStyle(0x2e7d32, 0.7);
            g.fillCircle(x, y, 10);
            g.fillCircle(x - 6, y + 4, 8);
            g.fillCircle(x + 6, y + 4, 8);
        }
        this.scenery.add(g);
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
        /*
        this.tweens.add({
            targets: this.bike,
            y: y - 3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        */
    }

    update(time: number, delta: number) {
        const scrollSpeed = (this.speed * delta) / 1000;
        const parallaxSpeed = (0.3 * delta) / 16.67;

        // Road scroll
        this.roadGroup.getChildren().forEach((line: any) => {
            line.y += scrollSpeed;
            if (line.y > this.scale.height + 50) line.y = -50;
        });

        // Nature scroll (parallax)
        this.scenery.getChildren().forEach((item: any) => {
             item.y += parallaxSpeed;
             if (item.y > this.scale.height + 100) {
                 item.y = -100;
                 item.x = (this.scale.width / 2) + ((Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 200));
             }
        });
    }
}
