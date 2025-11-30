# Game Configuration

# Tick rate (updates per second)
TICK_RATE = 20
TICK_INTERVAL = 1.0 / TICK_RATE

# Coin settings
MAX_COINS = 10
COIN_SPAWN_INTERVAL = 3.0  # seconds
COIN_RADIUS = 5.0
COIN_COLLECTION_RADIUS = 2.0

# Player settings
PLAYER_SPEED = 3.0  # units per input
PLAYER_SHAPE_DIMENSION = 6.0
PLAYER_SHAPES = {
    0: "circle",
    1: "square"
}

# Map settings
MAP_WIDTH = 800
MAP_HEIGHT = 600

# Network settings
LATENCY_MS = 200  # Total round-trip latency
LATENCY_SECONDS = (LATENCY_MS) / 1000.0  # Half for each direction

# Game settings
GAME_DURATION = 180  # 3 minutes in seconds
AUTO_START_TIMER = 15  # seconds to wait before auto-starting

# Server settings
SERVER_HOST = "localhost"
SERVER_PORT = 8000

