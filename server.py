import asyncio
import websockets
import json
import time
from config import *
from game_state import GameState

class GameServer:
    def __init__(self):
        self.game_state = GameState()
        self.running = False
        
    async def handle_client(self, websocket, path=None):
        """Handle a new client connection."""
        player_name = None
        
        try:
            # Wait for player name
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get("type") == "connected":
                        player_name = data.get("name", f"Player{len(self.game_state.players)}")
                        
                        # Add player to game
                        if self.game_state.add_player(player_name, websocket):
                            print(f"Player {player_name} connected")
                            
                            # Send confirmation
                            await self.send_with_latency(websocket, {
                                "type": "connected",
                                "name": player_name,
                                "id": self.game_state.players[player_name]["id"],
                                "shape": self.game_state.players[player_name]["shape"]
                            })
                            
                            # Check if we can start the game
                            if self.game_state.can_start_game() and not self.game_state.game_started:
                                # Send lobby update
                                await self.broadcast_lobby_update()
                        else:
                            await self.send_with_latency(websocket, {
                                "type": "error",
                                "message": "Name already taken"
                            })
                            break
                    
                    elif data.get("type") == "start_game":
                        # Player requested to start game
                        if self.game_state.can_start_game() and not self.game_state.game_started:
                            self.game_state.start_game()
                            print("Game started!")
                            await self.broadcast_game_start()
                    
                    elif data.get("type") == "input":
                        # Handle player input
                        if player_name and player_name in self.game_state.players:
                            direction = data.get("dir")
                            if direction in ["up", "down", "left", "right"]:
                                self.game_state.update_player_position(player_name, direction)
                
                except json.JSONDecodeError:
                    print(f"Invalid JSON received: {message}")
                except Exception as e:
                    print(f"Error handling message: {e}")
        
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            if player_name:
                print(f"Player {player_name} disconnected")
                self.game_state.remove_player(player_name)
                # Notify other players
                await self.broadcast_lobby_update()
    
    async def send_with_latency(self, websocket, message):
        """Send message with simulated latency."""
        await asyncio.sleep(LATENCY_SECONDS)
        await websocket.send(json.dumps(message))
    
    async def broadcast_lobby_update(self):
        """Broadcast lobby status to all players."""
        message = {
            "type": "lobby_update",
            "player_count": len(self.game_state.lobby_players),
            "can_start": self.game_state.can_start_game()
        }
        
        for player_name, player_data in self.game_state.players.items():
            try:
                await self.send_with_latency(player_data["ws"], message)
            except:
                pass
    
    async def broadcast_game_start(self):
        """Broadcast game start to all players."""
        message = {
            "type": "game_start",
            "players": {name: {
                "id": data["id"],
                "shape": data["shape"]
            } for name, data in self.game_state.players.items()}
        }
        
        for player_name, player_data in self.game_state.players.items():
            try:
                await self.send_with_latency(player_data["ws"], message)
            except:
                pass
    
    async def game_loop(self):
        """Main game loop running at tick rate."""
        while self.running:
            start_time = time.time()
            
            # Update game state
            self.game_state.update()
            
            # Broadcast state to all clients
            state_message = self.game_state.get_state_message()
            
            # Check if game ended
            if self.game_state.game_started:
                if state_message.get("time_remaining") == 0:
                    winner = self.game_state.get_winner()
                    end_message = {
                        "type": "game_end",
                        "winner": winner,
                        "scores": {name: data["score"] for name, data in self.game_state.players.items()}
                    }
                    
                    for player_name, player_data in list(self.game_state.players.items()):
                        try:
                            await self.send_with_latency(player_data["ws"], end_message)
                        except:
                            pass
                    
                    # Reset game state
                    self.game_state = GameState()
                else:
                    # Send state update
                    for player_name, player_data in list(self.game_state.players.items()):
                        try:
                            await self.send_with_latency(player_data["ws"], state_message)
                        except:
                            pass
            
            # Sleep to maintain tick rate
            elapsed = time.time() - start_time
            sleep_time = max(0, TICK_INTERVAL - elapsed)
            await asyncio.sleep(sleep_time)
    
    async def start(self):
        """Start the game server."""
        self.running = True
        
        # Start game loop
        game_task = asyncio.create_task(self.game_loop())
        
        # Start WebSocket server
        print(f"Starting game server on {SERVER_HOST}:{SERVER_PORT}")
        async with websockets.serve(self.handle_client, SERVER_HOST, SERVER_PORT):
            await game_task

if __name__ == "__main__":
    server = GameServer()
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\nServer shutting down...")

