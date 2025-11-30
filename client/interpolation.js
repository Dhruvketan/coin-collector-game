// Enhanced interpolation for smooth player movement with reduced stutter
class Interpolation {
    constructor() {
        // Position history buffer for each player
        this.positionHistory = {}; // {player_name: [{x, y, timestamp}, ...]}
        this.maxHistorySize = 3; // Keep last 3 positions
        this.interpolationDelay = 50; // ms delay to smooth out jitter
        this.extrapolationTime = 100; // ms to extrapolate ahead
    }

    updateTargetPosition(playerName, x, y) {
        const now = performance.now();
        
        // Initialize history if needed
        if (!this.positionHistory[playerName]) {
            this.positionHistory[playerName] = [];
        }
        
        const history = this.positionHistory[playerName];
        
        // Add new position to history
        history.push({
            x: x,
            y: y,
            timestamp: now
        });
        
        // Keep only recent positions
        while (history.length > this.maxHistorySize) {
            history.shift();
        }
    }

    getInterpolatedPosition(playerName, currentTime) {
        const history = this.positionHistory[playerName];
        
        if (!history || history.length === 0) {
            return null;
        }
        
        // Apply interpolation delay to smooth out network jitter
        const renderTime = currentTime - this.interpolationDelay;
        
        // Find the two positions to interpolate between
        let prevIndex = -1;
        let nextIndex = -1;
        
        for (let i = 0; i < history.length - 1; i++) {
            if (history[i].timestamp <= renderTime && history[i + 1].timestamp >= renderTime) {
                prevIndex = i;
                nextIndex = i + 1;
                break;
            }
        }
        
        // If we found positions to interpolate between
        if (prevIndex >= 0 && nextIndex >= 0) {
            const prev = history[prevIndex];
            const next = history[nextIndex];
            const timeDiff = renderTime - prev.timestamp;
            const totalTime = next.timestamp - prev.timestamp;
            
            if (totalTime > 0) {
                const t = Math.min(1, Math.max(0, timeDiff / totalTime));
                // Smooth interpolation using Hermite interpolation (smoothstep)
                const smoothT = t * t * (3 - 2 * t);
                
                return {
                    x: prev.x + (next.x - prev.x) * smoothT,
                    y: prev.y + (next.y - prev.y) * smoothT
                };
            }
        }
        
        // Extrapolation: if we're ahead of all updates, predict movement
        if (history.length >= 2) {
            const latest = history[history.length - 1];
            const previous = history[history.length - 2];
            
            // Only extrapolate if we're slightly ahead (within extrapolation window)
            const timeSinceUpdate = renderTime - latest.timestamp;
            if (timeSinceUpdate > 0 && timeSinceUpdate < this.extrapolationTime) {
                const timeDiff = latest.timestamp - previous.timestamp;
                if (timeDiff > 0) {
                    // Calculate velocity
                    const vx = (latest.x - previous.x) / timeDiff;
                    const vy = (latest.y - previous.y) / timeDiff;
                    
                    // Extrapolate position
                    return {
                        x: latest.x + vx * timeSinceUpdate,
                        y: latest.y + vy * timeSinceUpdate
                    };
                }
            }
        }
        
        // Return latest position if no interpolation/extrapolation possible
        const latest = history[history.length - 1];
        return {
            x: latest.x,
            y: latest.y
        };
    }

    reset() {
        this.positionHistory = {};
    }
}

// Global interpolation instance
window.interpolation = new Interpolation();

