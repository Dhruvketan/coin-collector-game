import math
import random
from config import MAP_WIDTH, MAP_HEIGHT, COIN_RADIUS

def distance(p1, p2):
    """Calculate Euclidean distance between two points."""
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

def random_position():
    """Generate random coordinates for coin spawning."""
    # Ensure coins spawn within map bounds, accounting for coin radius
    margin = COIN_RADIUS + 5  # Add small margin for safety
    x = random.uniform(margin, MAP_WIDTH - margin)
    y = random.uniform(margin, MAP_HEIGHT - margin)
    return (x, y)

def is_within_collection_radius(player_pos, coin_pos, collection_radius):
    """Check if player is within collection radius of a coin."""
    dist = distance(player_pos, coin_pos)
    return dist <= collection_radius

