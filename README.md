# Critter - Your Digital Wildlife Journal 📸

Inspired by Pokemon Snap, Critter is a modern web application that lets you document and collect wildlife encounters during your real-world adventures. Think of it as your digital field journal for nature photography and wildlife spotting.

## Features 🌟

- **Photo-Centric Documentation**: Capture and upload photos of wildlife you encounter
- **Location Tracking**: Automatically extracts GPS coordinates from photo metadata or allows manual location pinning
- **Rich Details**: Record species names, nicknames, dates spotted, and field notes
- **Interactive Map View**: View where you encountered each critter using OpenStreetMap integration
- **Collection Management**: Build and manage your personal wildlife collection
- **Secure Authentication**: Support for email/password and OAuth login options

## Technology Stack 🛠️

- **Frontend**: React with TypeScript
- **UI Framework**: Chakra UI
- **Map Integration**: Leaflet with React-Leaflet
- **Backend**: PocketBase
- **Image Processing**: ExifReader for metadata extraction
- **Build Tool**: Vite

## Getting Started 🚀

1. Clone the repository:
```bash
git clone https://github.com/jacob-craffey/critter.git
cd critter
```

2. Install dependencies:

```bash
npm install
```

3. Set up PocketBase:
    - Download and install PocketBase
    - Create collections for users and critters
    - Configure OAuth providers if desired
4. Create a .env file with your configuration:
```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```
5. Start the development server:
```bash
npm run dev
```

## Collection Schema 📝
### Critters
- species_name (required): Scientific or common name
- nick_name (optional): Personal nickname for the critter
- date_spotted: Date of encounter
- photo: Image file
- notes: Additional observations
- latitude: GPS coordinate
- longitude: GPS coordinate
- user_id: Reference to user who logged the critter


## Contributing 🤝
Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄
This project is licensed under the ISC License.

## Acknowledgments 🙏
- Inspired by Nintendo's Pokemon Snap
- OpenStreetMap for mapping functionality
- PocketBase for backend services
-  All contributors and users of the application