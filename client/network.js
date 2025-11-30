// Network communication with server
class Network {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.latency = 100; // 100ms latency per direction (200ms total round-trip)
        this.messageQueue = [];
    }

    connect(serverUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(serverUrl);
                
                this.ws.onopen = () => {
                    console.log("Connected to server");
                    this.connected = true;
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    // Simulate latency on receive
                    setTimeout(() => {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    }, this.latency);
                };
                
                this.ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                };
                
                this.ws.onclose = () => {
                    console.log("Disconnected from server");
                    this.connected = false;
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    send(message) {
        if (!this.connected || !this.ws) {
            console.error("Not connected to server");
            return;
        }
        
        // Simulate latency on send
        setTimeout(() => {
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }, this.latency);
    }

    handleMessage(message) {
        // Dispatch message to appropriate handler
        if (window.game) {
            window.game.handleServerMessage(message);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.connected = false;
        }
    }
}

// Global network instance
window.network = new Network();

