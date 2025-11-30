# Coin Collector - Multiplayer Game

A real-time multiplayer coin collection game with authoritative server architecture, network latency simulation, and smooth client-side interpolation.

## Overview

This is a 2D multiplayer game where players compete to collect coins that spawn randomly on the map. The game features:

- **Authoritative Server**: All game logic, collision detection, and scoring is handled server-side
- **Network Latency Simulation**: 200ms latency on all network communications
- **Smooth Interpolation**: Client-side interpolation ensures smooth player movement despite latency
- **Real-time Synchronization**: WebSocket-based communication for real-time state updates

## Architecture

### Server Components
- `server.py` - Main WebSocket server handling client connections and game loop
- `game_state.py` - Game state management, collision detection, coin spawning
- `config.py` - Game configuration constants
- `utils.py` - Utility functions for distance calculation and random positioning

### Client Components
- `index.html` - Main game interface
- `style.css` - Styling for the game UI
- `game.js` - Main game logic, rendering, and input handling
- `network.js` - WebSocket client and network communication
- `interpolation.js` - Smooth position interpolation for remote players

## Requirements

- Python 3.7+
- Web browser with WebSocket support
- `websockets` Python library

## Installation

1. Install Python dependencies:
```bash
pip install websockets
```

## Running the Game

### Step 1: Start the Server

```bash
python server.py
```

The server will start on `localhost:8000`. You should see:
```
Starting game server on localhost:8000
```

### Step 2: Open Client Windows

1. Open `client/index.html` in your web browser (or use a local web server)
2. Open a second browser window/tab with `client/index.html` (or use a different browser)
3. Enter player names and connect

**Note**: For best results, use a local web server to serve the client files. You can use Python's built-in server:

```bash
cd client
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Alternative
Just run the below command
'''bash
.\start_game.bat
'''

### Step 3: Play

1. Enter your player name in each client window
2. Wait for both players to connect (lobby will show player count)
3. Game will auto-start after 15 seconds, or click "Start Now" to begin immediately
4. Use arrow keys (or WASD) to move your player
5. Collect coins to increase your score
6. Game lasts 3 minutes, player with highest score wins

## Game Features

### Server Authority
- Server validates all player movements
- Server handles collision detection between players and coins
- Server maintains authoritative game state
- Clients cannot spoof positions or scores

### Network Latency
- All network messages are delayed by 200ms (simulated)
- This tests the game's resilience to network conditions
- Interpolation ensures smooth visual experience despite latency

### Interpolation
- Remote players' positions are interpolated smoothly
- Uses cubic ease-out interpolation for natural movement
- Prevents visual stuttering from delayed position updates

### Game Mechanics
- **Map Size**: 800x600 units
- **Player Speed**: 1 unit per input
- **Coin Spawn**: Every 10 seconds, max 2 coins on screen
- **Coin Collection**: Players collect coins within 1 unit radius
- **Game Duration**: 3 minutes
- **Player Shapes**: Circle (Player 1) and Square (Player 2)

## Configuration

Game settings can be modified in `config.py`:

- `TICK_RATE`: Server update frequency (default: 20 Hz)
- `MAX_COINS`: Maximum coins on screen (default: 2)
- `COIN_SPAWN_INTERVAL`: Time between coin spawns (default: 10 seconds)
- `PLAYER_SPEED`: Movement speed (default: 1.0)
- `LATENCY_MS`: Simulated network latency (default: 200ms)
- `GAME_DURATION`: Game length in seconds (default: 180)

## Technical Details

### Message Protocol

**Client → Server:**
```json
{
  "type": "connected",
  "name": "PlayerName"
}

{
  "type": "input",
  "dir": "up|down|left|right"
}

{
  "type": "start_game"
}
```

**Server → Client:**
```json
{
  "type": "state",
  "players": {
    "PlayerName": {
      "id": 0,
      "x": 100.0,
      "y": 200.0,
      "score": 5,
      "shape": 0
    }
  },
  "coins": [
    {"id": 0, "x": 150.0, "y": 250.0}
  ],
  "game_started": true,
  "time_remaining": 120.5
}
```

### Collision Resolution
- When multiple players are within collection radius of a coin, the closest player wins
- Server calculates distances and awards the coin accordingly

### Interpolation Algorithm
- Stores previous and target positions with timestamps
- Interpolates between positions based on time elapsed
- Uses cubic ease-out for smooth acceleration/deceleration

## Troubleshooting

**Server won't start:**
- Check if port 8000 is already in use
- Ensure `websockets` library is installed: `pip install websockets`

**Clients can't connect:**
- Verify server is running
- Check browser console for WebSocket errors
- Ensure firewall isn't blocking localhost connections

**Game feels laggy:**
- This is expected due to 200ms latency simulation
- Interpolation should make movement smooth despite latency
- Check browser performance (disable extensions if needed)

**Players not moving smoothly:**
- Interpolation should handle this automatically
- Check browser console for JavaScript errors
- Ensure `interpolation.js` is loaded correctly

## Assumptions

- Clients connect via localhost only
- Game pauses if a player disconnects
- Coins are circular
- All distances measured center-to-center
- Game ends after 3 minutes or when time runs out

## Future Improvements

- Reconnection handling for disconnected players
- Multiple game rooms/sessions
- Spectator mode
- Power-ups and special coins
- Larger player counts
- Customizable game settings

## License

This project is created for the Krafton Associate Game Developer Test.

