# Concrete Rush: Bag Hunt 🏍️

**Concrete Rush** is a cinematic, high-speed futuristic highway runner. Set in a solar-drenched "Solar-Cyber" environment, you assume the role of a precision network operative navigating the high-stakes highway of the Concrete ecosystem.

> [!TIP]
> For a deep dive into the technical architecture, design philosophy, and future roadmap, see [DOCS.md](./DOCS.md).

## 🌅 The Experience
Concrete Rush moves away from traditional dark cyberpunk tropes, offering a **cinematic daytime atmospheric experience**. 
- **Breathtaking Visuals**: Sapphire sky gradients, warm solar flares, and parallax-scrolling nature.
- **Neural Identity**: Establish your profile, track your yield, and earn your place among the "Network Legends."
- **High-Fidelity Audio**: Immersive engine sounds and a responsive synth-wave soundtrack.

## 🛠 Tech Stack
- **Engine**: Phaser 3 (Arcade Physics & Rendering)
- **UI Framework**: React 18 & TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Motion (React) & Phaser Tweens
- **Persistence**: LocalStorage Profile API

## 🎮 Operative Manual
- **Steer**: `A / D` or `Left / Right` arrow keys. (Touch swipe supported on mobile)
- **Pause**: `P` key.
- **Collect Yield**: Capture golden data-nodes (+10 points).
- **Multipliers**: Grab blue data-pads for 2x Score Multiplier.
- **Avoid Hazards**: Dodge red "Maintenance Bags" to preserve hull integrity.
- **Neural Death**: Losing all 3 health points terminates the current link session.

## 🚀 Deployment & Development
### Local Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

The production output is served from the `dist` directory. Compatible with Vercel, Netlify, and Cloud Run deployments.

## 📄 Documentation
Detailed technical specifications, including performance optimization strategies and component architecture, can be found in the **[Complete Documentation Guide](./DOCS.md)**.
