import time
import random
from config import *
from utils import distance, random_position, is_within_collection_radius

class GameState:
    def __init__(self):
        self.players = {}  # {player_name: {id, x, y, score, shape, ws}}
        self.coins = []  # [{id, x, y}, ...]
        self.next_coin_id = 0
        self.next_player_id = 0
        self.game_started = False
        self.game_start_time = None
        self.last_coin_spawn_time = 0
        self.lobby_players = []  # Players waiting in lobby
        
    def add_player(self, player_name, websocket):
        """Add a new player to the game."""
        if player_name in self.players:
            return False
        
        # Assign shape based on player order
        shape = len(self.players) % 2  # Alternates between 0 (circle) and 1 (square)
        
        # Random starting position
        x = random.uniform(50, MAP_WIDTH - 50)
        y = random.uniform(50, MAP_HEIGHT - 50)
        
        player_data = {
            "id": self.next_player_id,
            "x": x,
            "y": y,
            "score": 0,
            "shape": shape,
            "ws": websocket
        }
        
        self.players[player_name] = player_data
        self.lobby_players.append(player_name)
        self.next_player_id += 1
        return True
    
    def remove_player(self, player_name):
        """Remove a player from the game."""
        if player_name in self.players:
            del self.players[player_name]
        if player_name in self.lobby_players:
            self.lobby_players.remove(player_name)
    
    def can_start_game(self):
        """Check if game can start (at least 2 players in lobby)."""
        return len(self.lobby_players) >= 2
    
    def start_game(self):
        """Start the game session."""
        if not self.game_started and self.can_start_game():
            self.game_started = True
            self.game_start_time = time.time()
            self.last_coin_spawn_time = time.time()
            # Spawn initial coins
            for _ in range(MAX_COINS):
                self.spawn_coin()
            return True
        return False
    
    def spawn_coin(self):
        """Spawn a new coin if under max limit."""
        if len(self.coins) < MAX_COINS:
            coin = {
                "id": self.next_coin_id,
                "x": random_position()[0],
                "y": random_position()[1]
            }
            self.coins.append(coin)
            self.next_coin_id += 1
    
    def update_player_position(self, player_name, direction):
        """Update player position based on movement direction."""
        if player_name not in self.players:
            return
        
        player = self.players[player_name]
        new_x = player["x"]
        new_y = player["y"]
        
        if direction == "up":
            new_y = max(PLAYER_SHAPE_DIMENSION / 2, player["y"] - PLAYER_SPEED)
        elif direction == "down":
            new_y = min(MAP_HEIGHT - PLAYER_SHAPE_DIMENSION / 2, player["y"] + PLAYER_SPEED)
        elif direction == "left":
            new_x = max(PLAYER_SHAPE_DIMENSION / 2, player["x"] - PLAYER_SPEED)
        elif direction == "right":
            new_x = min(MAP_WIDTH - PLAYER_SHAPE_DIMENSION / 2, player["x"] + PLAYER_SPEED)
        
        # Update position
        player["x"] = new_x
        player["y"] = new_y
    
    def check_coin_collisions(self):
        """Check and resolve coin collisions."""
        coins_to_remove = []
        
        for coin in self.coins:
            eligible_players = []
            
            # Find all players within collection radius
            for player_name, player_data in self.players.items():
                player_pos = (player_data["x"], player_data["y"])
                coin_pos = (coin["x"], coin["y"])
                
                if is_within_collection_radius(player_pos, coin_pos, COIN_COLLECTION_RADIUS):
                    dist = distance(player_pos, coin_pos)
                    eligible_players.append((player_name, dist))
            
            # If any player is eligible, award coin to closest player
            if eligible_players:
                eligible_players.sort(key=lambda x: x[1])  # Sort by distance
                winner_name = eligible_players[0][0]
                self.players[winner_name]["score"] += 1
                coins_to_remove.append(coin)
        
        # Remove collected coins
        for coin in coins_to_remove:
            self.coins.remove(coin)
    
    def update(self):
        """Update game state (called every tick)."""
        if not self.game_started:
            return
        
        current_time = time.time()
        
        # Check if game should end
        if self.game_start_time and (current_time - self.game_start_time) >= GAME_DURATION:
            return
        
        # Spawn coins periodically
        if current_time - self.last_coin_spawn_time >= COIN_SPAWN_INTERVAL:
            self.spawn_coin()
            self.last_coin_spawn_time = current_time
        
        # Check for coin collisions
        self.check_coin_collisions()
        
        # Ensure we maintain max coins
        while len(self.coins) < MAX_COINS:
            self.spawn_coin()
    
    def get_state_message(self):
        """Get current game state as a message for clients."""
        players_data = {}
        for name, data in self.players.items():
            players_data[name] = {
                "id": data["id"],
                "x": data["x"],
                "y": data["y"],
                "score": data["score"],
                "shape": data["shape"]
            }
        
        coins_data = [{"id": c["id"], "x": c["x"], "y": c["y"]} for c in self.coins]
        
        current_time = time.time()
        time_remaining = None
        if self.game_started and self.game_start_time:
            elapsed = current_time - self.game_start_time
            time_remaining = max(0, GAME_DURATION - elapsed)
        
        return {
            "type": "state",
            "players": players_data,
            "coins": coins_data,
            "game_started": self.game_started,
            "time_remaining": time_remaining,
            "lobby_count": len(self.lobby_players)
        }
    
    def get_winner(self):
        """Get the winner of the game."""
        if not self.game_started:
            return None
        
        max_score = -1
        winner = None
        
        for name, data in self.players.items():
            if data["score"] > max_score:
                max_score = data["score"]
                winner = name
        
        return winner

