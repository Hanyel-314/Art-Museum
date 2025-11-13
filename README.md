# Interactive Art Museum

An immersive 3D interactive art museum experience built with Three.js. Walk through a realistic museum corridor, view masterpiece paintings behind protective glass, and examine artworks in stunning detail with full 360° rotation.

## Features

### 🚪 Entrance Scene
- Realistic neoclassical museum doors with brass handles
- Polished stone floor with reflections
- Animated door opening with smooth camera transition
- Atmospheric lighting and ambient effects

### 🖼️ Exhibition Corridor
- Long elegant gallery hall with polished marble floors
- Museum-grade lighting with ceiling panels and spotlights
- Six masterpiece paintings (three on each wall)
- Interactive wall selection to view galleries

### 🎨 Artwork Galleries
- Left and right wall galleries with three paintings each
- Paintings displayed in dark wood frames with protective glass
- Anti-reflection glass with realistic reflections
- Brass plaques with artwork information
- Hover effects and smooth transitions

### 🔍 Detailed Artwork View
- **360° Rotation**: Click and drag to rotate paintings and view all sides
- See the back of the canvas with linen texture and wooden support bars
- Zoom in/out with mouse wheel (up to 300%)
- Tilt artwork vertically for different viewing angles
- Detailed information panel with title, artist, year, medium, and description
- Cinematic lighting to showcase artwork details

### 🎮 Interaction Features
- Smooth camera transitions between all scenes
- Intuitive navigation with back buttons at every level
- Hover tooltips and visual feedback
- Responsive cursor states (pointer, grab, grabbing)
- Professional UI overlay with elegant styling

## Artwork Collection

### Left Gallery
1. **Starry Night** - Vincent van Gogh (1889)
2. **The Great Wave off Kanagawa** - Katsushika Hokusai (1831)
3. **Girl with a Pearl Earring** - Johannes Vermeer (1665)

### Right Gallery
1. **The Scream** - Edvard Munch (1893)
2. **The Birth of Venus** - Sandro Botticelli (1485)
3. **The Kiss** - Gustav Klimt (1908)

## Technical Implementation

### Technologies
- **Three.js** - 3D rendering and WebGL graphics
- **Vite** - Fast development server and build tool
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern UI styling with animations

### Key Features
- **Realistic Materials**:
  - Polished marble floors with reflections
  - Dark walnut wood frames with proper roughness
  - Anti-reflection glass with clearcoat
  - Canvas linen texture on painting backs

- **Advanced Lighting**:
  - Ambient museum lighting (3500-4000K color temperature)
  - Spotlights above each painting
  - Ceiling recessed lights
  - Key and rim lights for detail view

- **Smooth Animations**:
  - Ease-in-out cubic timing functions
  - 800ms camera transitions
  - Interpolated rotations and positions
  - No jarring movements

- **Performance Optimized**:
  - Efficient raycasting for interactions
  - Shadow mapping with PCF soft shadows
  - ACES filmic tone mapping
  - Texture loading with fallbacks

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Art-Museum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Building for Production

```bash
npm run build
```

The optimized build will be created in the `dist` folder.

## Usage Guide

1. **Entrance**: Click on the museum doors to enter
2. **Corridor**: Click on the left or right wall to view that gallery
3. **Gallery Wall**: Click on any painting to view it in detail
4. **Detail View**:
   - Drag to rotate the artwork 360°
   - Scroll to zoom in/out
   - Click the back button to return to the gallery
5. **Navigation**: Use the back button to navigate between scenes

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (WebGL 2.0 required)
- Opera

## Project Structure

```
Art-Museum/
├── index.html          # Main HTML file
├── styles.css          # UI styling
├── main.js             # Three.js application logic
├── package.json        # Dependencies
└── README.md          # Documentation
```

## Customization

### Adding New Paintings

Edit the `PAINTINGS_DATA` object in `main.js`:

```javascript
const PAINTINGS_DATA = {
    left: [
        {
            title: "Your Painting Title",
            artist: "Artist Name",
            year: "Year",
            medium: "Medium",
            description: "Description...",
            imageUrl: "https://your-image-url.jpg"
        },
        // ... more paintings
    ],
    right: [
        // ... right wall paintings
    ]
};
```

### Adjusting Lighting

Modify the lighting parameters in `createCorridorScene()` and `createDetailedArtwork()` functions.

### Changing Materials

Edit material properties in the respective creation functions:
- `createEntranceScene()` - Door and ground materials
- `createCorridorScene()` - Floor, ceiling, walls
- `createWallPaintings()` - Frame and glass materials
- `createDetailedArtwork()` - Detailed artwork materials

## Performance Tips

- The application uses high-quality textures from external URLs
- First load may take a moment while images are fetched
- Hardware acceleration is recommended for best performance
- Reduce pixel ratio on lower-end devices by modifying:
  ```javascript
  renderer.setPixelRatio(1); // Instead of window.devicePixelRatio
  ```

## Future Enhancements

Potential features for future development:
- [ ] Audio guide narration for each painting
- [ ] Virtual reality (VR) support
- [ ] More exhibition rooms
- [ ] Interactive lighting controls
- [ ] Multiple museum themes
- [ ] Save favorite artworks
- [ ] Social sharing features
- [ ] Mobile touch optimizations

## Credits

- Artwork images sourced from Wikimedia Commons
- Three.js library by mrdoob and contributors
- Museum concept and implementation by the Art Museum team

## License

MIT License - Feel free to use this project for educational and personal purposes.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Enjoy your virtual museum experience! 🎨**
