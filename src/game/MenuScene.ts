import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    private clouds!: Phaser.GameObjects.Group;

    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;
        
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
        for(let i=0; i<6; i++) {
            const cloud = this.add.circle(Math.random()*width, Math.random()*height*0.5, 30 + Math.random()*40, 0xffffff, 0.05);
            this.clouds.add(cloud);
        }

        // Floating Pixel Particles for ambiance
        const pixels = this.add.graphics();
        pixels.fillStyle(0x00f0ff, 0.5);
        pixels.fillRect(0, 0, 4, 4);
        pixels.generateTexture('pixel-p', 4, 4);
        
        this.add.particles(0, 0, 'pixel-p', {
            x: { min: 0, max: width },
            y: height + 20,
            lifespan: { min: 4000, max: 8000 },
            speedY: { min: -10, max: -30 },
            scale: { start: 0.5, end: 1 },
            alpha: { start: 0.1, end: 0 },
            frequency: 400,
            blendMode: 'ADD'
        });
    }

    update() {
        // Static menu scene for cleaner lobby
    }
}
