# How to Run the Coin Collector Game

## Prerequisites

1. **Python 3.7 or higher** installed on your system
   - Check if Python is installed: Open PowerShell/Command Prompt and type `python --version`
   - If not installed, download from [python.org](https://www.python.org/downloads/)

2. **A modern web browser** (Chrome, Firefox, Edge, etc.)

## Step-by-Step Instructions

### Step 1: Install Python Dependencies

1. Open **PowerShell** or **Command Prompt**
2. Navigate to the project folder:
   ```powershell
   cd C:\Users\HP\Desktop\Krafton_PS
   ```
3. Install the required library:
   ```powershell
   pip install websockets
   ```
   
   If you get a permission error, try:
   ```powershell
   pip install --user websockets
   ```

### Step 2: Start the Game Server

1. In the same PowerShell/Command Prompt window, run:
   ```powershell
   python server.py
   ```

2. You should see:
   ```
   Starting game server on localhost:8000
   ```

3. **Keep this window open** - the server must stay running for the game to work!

### Step 3: Start the Client Web Server

1. Open a **NEW** PowerShell/Command Prompt window
2. Navigate to the client folder:
   ```powershell
   cd C:\Users\HP\Desktop\Krafton_PS\client
   ```
3. Start a local web server:
   ```powershell
   python -m http.server 8080
   ```

4. You should see:
   ```
   Serving HTTP on :: port 8080 (http://[::]:8080/) ...
   ```

5. **Keep this window open too!**

### Step 4: Open the Game in Your Browser

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: `http://localhost:8080`
3. You should see the game interface with a name input field

### Step 5: Open a Second Player Window

You need **two browser windows** to play (one for each player):

**Option A: Same Browser, Different Window**
- Open a new window (not just a new tab) in the same browser
- Go to `http://localhost:8080` again

**Option B: Different Browser**
- Open a different browser (e.g., if you used Chrome, open Firefox)
- Go to `http://localhost:8080`

### Step 6: Play the Game!

1. **In the first browser window:**
   - Enter a player name (e.g., "Player1")
   - Click "Connect"

2. **In the second browser window:**
   - Enter a different player name (e.g., "Player2")
   - Click "Connect"

3. **Wait in the lobby:**
   - Both windows will show "Waiting in Lobby"
   - When both players connect, you'll see "2 players ready!"
   - A 15-second countdown will start
   - You can click "Start Now" to begin immediately

4. **Play:**
   - Use **Arrow Keys** (↑ ↓ ← →) or **WASD** to move your player
   - Collect the golden coins to increase your score
   - The game lasts 3 minutes
   - Player with the highest score wins!

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Terminal 1: Server                     │
│  $ python server.py                     │
│  Starting game server on localhost:8000 │
│  (Keep running)                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Terminal 2: Client Web Server          │
│  $ cd client                            │
│  $ python -m http.server 8080           │
│  Serving HTTP on :: port 8080...        │
│  (Keep running)                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Browser Window 1                       │
│  http://localhost:8080                  │
│  Player: "Player1"                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Browser Window 2                       │
│  http://localhost:8080                  │
│  Player: "Player2"                      │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Problem: "python is not recognized"
**Solution:** Python is not in your PATH. Try:
- `py server.py` instead of `python server.py`
- Or reinstall Python and check "Add Python to PATH" during installation

### Problem: "ModuleNotFoundError: No module named 'websockets'"
**Solution:** The websockets library isn't installed. Run:
```powershell
pip install websockets
```

### Problem: "Address already in use" error
**Solution:** Port 8000 or 8080 is already in use. You can:
- Close the program using that port
- Or modify `config.py` to use a different port (change `SERVER_PORT = 8000`)

### Problem: Can't connect to server
**Solution:** 
- Make sure the server is running (Step 2)
- Check that you see "Starting game server on localhost:8000"
- Make sure no firewall is blocking localhost connections

### Problem: Game feels laggy
**Solution:** This is **expected**! The game simulates 200ms network latency to test resilience. The interpolation should make movement smooth despite the delay.

### Problem: Players not moving smoothly
**Solution:**
- Check browser console (F12) for errors
- Make sure all JavaScript files are loading correctly
- Try refreshing the page

### Problem: "Failed to connect to server"
**Solution:**
- Verify server is running in Terminal 1
- Check that server shows "Starting game server on localhost:8000"
- Try closing and restarting the server

## Quick Start Script (Optional)

You can create a batch file to start everything at once. Create a file named `start_game.bat`:

```batch
@echo off
echo Starting Coin Collector Game...
start "Game Server" cmd /k "python server.py"
timeout /t 2
start "Client Server" cmd /k "cd client && python -m http.server 8080"
timeout /t 2
start http://localhost:8080
echo Game started! Open another browser window to http://localhost:8080 for the second player.
pause
```

Double-click `start_game.bat` to start everything automatically.

## Stopping the Game

1. Close both browser windows
2. In Terminal 1 (server): Press `Ctrl+C` to stop the server
3. In Terminal 2 (client server): Press `Ctrl+C` to stop the web server

## Need Help?

- Check the `README.md` for more technical details
- Review the browser console (F12) for error messages
- Make sure all files are in the correct folders

Enjoy playing!

