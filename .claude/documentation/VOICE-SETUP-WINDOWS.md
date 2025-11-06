# Voice Setup Guide for Windows

**Complete guide for setting up voice notifications on Windows 11 with PAI**

After testing all available options, this guide focuses on what actually works best on Windows.

---

## Overview

PAI can speak notifications when tasks complete using voice synthesis. On Windows, you have two main options:

1. **ElevenLabs TTS** (Recommended) - Natural, high-quality voices
2. **Windows SAPI** (Built-in fallback) - Free but robotic

The optimized voice server (`server.windows.optimized.ts`) handles both automatically.

---

## Quick Start (5 Minutes)

### 1. Choose Your Voice System

**Option A: ElevenLabs (Recommended)**
- **Quality**: Extremely natural, human-like
- **Cost**: Free tier available (10,000 characters/month)
- **Setup**: Requires API key
- **Best for**: Daily use, professional environments

**Option B: Windows SAPI (Free)**
- **Quality**: Robotic but functional
- **Cost**: Completely free
- **Setup**: No API key needed
- **Best for**: Testing, minimal use

---

## Setup: ElevenLabs (Recommended)

### Step 1: Get ElevenLabs API Key

1. Go to [elevenlabs.io](https://elevenlabs.io/)
2. Sign up for a free account
3. Navigate to your profile (click your avatar in the top right)
4. Click "API Keys"
5. Click "Create API Key"
6. Copy your API key (starts with `sk_...`)

**Free Tier Limits:**
- 10,000 characters per month
- Access to all voices
- Good for occasional use

**Paid Plans:**
- More characters per month
- Voice cloning
- Commercial use

### Step 2: Add API Key to Environment

```powershell
# Open your .env file
notepad C:\Users\$env:USERNAME\.claude\.env
```

Add your ElevenLabs API key:

```env
# Voice Server Configuration
ELEVENLABS_API_KEY=sk_your_api_key_here
PORT=8888
```

Save the file (Ctrl+S) and close Notepad.

### Step 3: Choose Your Voices

ElevenLabs offers many natural-sounding voices. You can customize which voice each agent uses.

**Recommended Voice Configuration:**

Edit `C:\Users\YourName\.claude\voice-server\server.windows.optimized.ts`:

Look for the `VOICES` configuration (around line 20):

```typescript
const VOICES = {
  kai: "Brian",           // Professional British male
  researcher: "Bella",    // Clear American female
  engineer: "Adam",       // Technical American male
  architect: "Alice",     // Sophisticated British female
  designer: "Freya",      // Creative voice
  pentester: "Callum",    // Sharp British male
};
```

**Available ElevenLabs Voices:**
- **Brian** - British male, professional
- **Adam** - American male, deep
- **Charlie** - Australian male, casual
- **Clyde** - American male, warm
- **Domi** - American female, confident
- **Fin** - Irish male, friendly
- **Freya** - American female, young
- **Giovanni** - English male, foreigner
- **Glinda** - American female, witch-like
- **Lily** - British female, soft
- **Nicole** - American female, whisper
- **Rachel** - American female, calm
- **Sarah** - American female, soft
- **Dorothy** - British female, pleasant
- **Josh** - American male, young
- **Arnold** - American male, crisp
- **Antoni** - American male, well-rounded
- **Thomas** - American male, meditative
- **Charlotte** - English-Swedish female
- **Alice** - British female, confident
- **Matilda** - American female, warm
- **Matthew** - British male, friendly
- **James** - Australian male, calm
- **Joseph** - British male, professional
- **Jeremy** - American-Irish male
- **Michael** - American male, old
- **Ethan** - American male, ASMR
- **Callum** - American male, hoarse
- **Patrick** - American male, shouty
- **Harry** - American male, anxious
- **Drew** - American male, well-rounded
- **Bill** - American male, strong
- **Daniel** - British male, deep
- **Bella** - American female, soft

### Step 4: Test Your Setup

```powershell
# Navigate to voice server directory
cd C:\Users\$env:USERNAME\.claude\voice-server

# Start the server manually (for testing)
bun server.windows.optimized.ts
```

**You should see:**
```
🚀 PAI Voice Server running on port 8888
🎙️  Using ElevenLabs TTS (High quality voices)
📡 POST to http://localhost:8888/notify
🔒 Security: CORS restricted to localhost, rate limiting enabled
```

**Test a voice:**

Open a new PowerShell window:

```powershell
# Test basic notification
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Voice server is working perfectly\"}'

# Test specific voice
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Hello, I am Kai\",\"voice_name\":\"Brian\"}'
```

You should hear the voice speak!

---

## Setup: Windows SAPI (Free Fallback)

If you don't want to use ElevenLabs, the server will automatically fall back to Windows SAPI.

### Step 1: No API Key Needed

Simply don't add an `ELEVENLABS_API_KEY` to your `.env` file. The server will automatically use Windows SAPI.

### Step 2: Check Available Voices

```powershell
# List all SAPI voices installed
powershell -Command "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }"
```

**Default Windows voices:**
- `Microsoft David Desktop` - Male, US English
- `Microsoft Zira Desktop` - Female, US English
- `Microsoft Mark` - Male (if installed)

### Step 3: Install Additional SAPI Voices (Optional)

Windows 11 includes few voices by default. You can install more:

1. Press Win+I to open Settings
2. Go to "Time & Language"
3. Click "Speech"
4. Under "Manage voices", click "Add voices"
5. Download additional language voices

**Note**: Even with additional voices, SAPI voices sound robotic compared to ElevenLabs.

### Step 4: Configure SAPI Voices

Edit `C:\Users\YourName\.claude\voice-server\server.windows.optimized.ts`:

Look for the SAPI fallback configuration:

```typescript
// SAPI fallback voices (if no ElevenLabs key)
const SAPI_VOICES = {
  kai: "Microsoft David Desktop",
  researcher: "Microsoft Zira Desktop",
  engineer: "Microsoft David Desktop",
  architect: "Microsoft Zira Desktop",
  designer: "Microsoft Zira Desktop",
  pentester: "Microsoft David Desktop",
};
```

### Step 5: Test SAPI Voices

```powershell
# Navigate to voice server
cd C:\Users\$env:USERNAME\.claude\voice-server

# Start server (will use SAPI automatically if no ElevenLabs key)
bun server.windows.optimized.ts
```

**You should see:**
```
🚀 PAI Voice Server running on port 8888
🎙️  Using Windows SAPI (Built-in voices)
📡 POST to http://localhost:8888/notify
```

**Test it:**

```powershell
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Testing Windows SAPI voices\"}'
```

---

## Running the Voice Server

### Start the Voice Server

**Easy method** (use the batch file):

```powershell
# Double-click or run:
C:\Users\$env:USERNAME\.claude\voice-server\start-voice-server.bat
```

This starts the server in the background and closes the window.

**Manual method**:

```powershell
cd C:\Users\$env:USERNAME\.claude\voice-server
bun server.windows.optimized.ts
```

### Check Server Status

```powershell
# Health check
curl http://localhost:8888/health
```

**Healthy response:**
```json
{
  "status": "healthy",
  "port": 8888,
  "voice_system": "ElevenLabs" | "Windows SAPI",
  "default_voice": "Brian"
}
```

### Stop the Voice Server

**Easy method** (create this batch file):

Create `C:\Users\YourName\stop-voice-server.bat`:

```batch
@echo off
echo Stopping PAI Voice Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8888') do taskkill /PID %%a /F
echo Voice server stopped.
pause
```

**Manual method:**

```powershell
# Find the process ID
netstat -ano | findstr :8888

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

---

## Understanding the Voice Server

### How It Works

1. **Task Completion**: When Kai or an agent completes a task, they emit a completion message
2. **Hook Intercepts**: The stop-hook (if configured) intercepts the completion
3. **Voice Request**: The hook sends the message to the voice server
4. **Voice Synthesis**: The server uses ElevenLabs or SAPI to generate speech
5. **Audio Playback**: The audio plays through your speakers
6. **Windows Notification**: A toast notification also appears

### Voice Server Architecture

```
┌─────────────────────────────────────────┐
│   Claude Code / Kai                      │
│   "Task completed!"                      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Stop Hook (optional)                   │
│   Intercepts completion messages         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Voice Server (port 8888)               │
│   server.windows.optimized.ts            │
└─────────────┬───────────────────────────┘
              │
              ├─────────────┬──────────────┐
              ▼             ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ElevenLabs│  │ Windows  │  │ Windows  │
        │   TTS    │  │   SAPI   │  │  Toast   │
        └─────┬────┘  └─────┬────┘  └─────┬────┘
              │             │              │
              └──────┬──────┴──────┬───────┘
                     ▼             ▼
              ┌──────────┐   ┌──────────┐
              │  Audio   │   │  Visual  │
              │  Output  │   │  Notify  │
              └──────────┘   └──────────┘
```

### Configuration Files

**Voice Server:**
`C:\Users\YourName\.claude\voice-server\server.windows.optimized.ts`

Contains:
- Voice mappings (which voice for which agent)
- ElevenLabs configuration
- SAPI fallback configuration
- Server settings

**Environment:**
`C:\Users\YourName\.claude\.env`

Contains:
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `PORT` - Voice server port (default: 8888)

**Stop Hook (Advanced):**
`C:\Users\YourName\.claude\hooks\stop-hook.ts`

Optional hook that automatically sends completion messages to the voice server.

---

## Advanced: Voice Customization

### Custom Voice Mappings

You can assign different voices to different agents:

Edit `server.windows.optimized.ts`:

```typescript
const VOICES = {
  kai: "Brian",              // Your main assistant
  researcher: "Bella",        // Research agent
  engineer: "Adam",           // Engineering agent
  architect: "Alice",         // Architecture agent
  designer: "Freya",          // Design agent
  pentester: "Callum",        // Security agent
  myagent: "Charlotte",       // Your custom agent
};
```

### Adjust Voice Settings

**ElevenLabs settings:**

```typescript
// Voice model selection
const model = "eleven_monolingual_v1"; // Fastest
// or
const model = "eleven_multilingual_v1"; // More languages
// or
const model = "eleven_turbo_v2"; // Lowest latency

// Voice settings
const voice_settings = {
  stability: 0.5,        // 0-1, higher = more consistent
  similarity_boost: 0.5, // 0-1, higher = more similar to original
  style: 0.0,           // 0-1, style exaggeration
  use_speaker_boost: true // Enhance clarity
};
```

**SAPI settings:**

```typescript
// Speech rate (-10 to 10)
synthesizer.Rate = 0;  // Normal speed

// Volume (0 to 100)
synthesizer.Volume = 100;  // Full volume
```

### Custom Notification Messages

When calling the voice server, you can customize messages:

```powershell
# Simple message
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Task complete\"}'

# With specific voice
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Research finished\",\"voice_name\":\"Bella\"}'

# With custom title
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Database backup complete\",\"title\":\"Maintenance\"}'
```

---

## Troubleshooting

### No Audio Output

**Check:**
1. Is your volume on and unmuted?
2. Is the voice server running? `curl http://localhost:8888/health`
3. Check Windows sound settings (Win+I → System → Sound)
4. Try a test: `curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"test\"}'`

### ElevenLabs Not Working

**Error**: "Invalid API key" or "Unauthorized"

**Check:**
1. Is your API key correct in `.env`?
2. Open `.env`: `notepad C:\Users\$env:USERNAME\.claude\.env`
3. Verify the key starts with `sk_`
4. Check your ElevenLabs dashboard for key status
5. Restart the voice server after changing `.env`

**Error**: "Rate limit exceeded"

**Solution**: You've used your free tier quota. Either:
- Wait for the monthly reset
- Upgrade to a paid plan
- Use Windows SAPI fallback (remove the API key from `.env`)

### Voice Sounds Wrong

**Problem**: Voice doesn't match agent

**Check:**
1. Open `server.windows.optimized.ts`
2. Verify the voice mappings in the `VOICES` object
3. Make sure voice names are spelled correctly
4. Restart the voice server

**Problem**: Voice is too fast/slow

**Solution**: Adjust voice settings in `server.windows.optimized.ts`

### Server Won't Start

**Error**: "Port 8888 already in use"

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :8888

# Kill the process
taskkill /PID <PID> /F

# Start server again
bun server.windows.optimized.ts
```

**Error**: "Bun command not found"

**Solution:**
```powershell
# Check if Bun is installed
bun --version

# If not installed:
irm bun.sh/install.ps1 | iex

# Close and reopen PowerShell
```

### Windows Toast Notifications Not Appearing

**Check:**
1. Open Settings (Win+I)
2. Go to System → Notifications
3. Make sure notifications are enabled
4. Check that "PowerShell" or "Windows Terminal" has notification permission

---

## Comparison: ElevenLabs vs Windows SAPI

| Feature | ElevenLabs | Windows SAPI |
|---------|-----------|--------------|
| **Quality** | ⭐⭐⭐⭐⭐ Natural, human-like | ⭐⭐ Robotic |
| **Cost** | Free tier: 10K chars/month | Completely free |
| **API Key** | Required | Not required |
| **Voices** | 30+ professional voices | 2-3 basic voices |
| **Latency** | ~1-2 seconds | Instant |
| **Accents** | Many (US, UK, AUS, etc.) | US English only |
| **Internet** | Required | Works offline |
| **Setup** | Medium (need API key) | Easy (built-in) |

**Recommendation**: Use ElevenLabs for regular use, Windows SAPI as fallback.

---

## Testing All Voices

### Test ElevenLabs Voices

```powershell
# Test each agent voice
$voices = @("Brian", "Bella", "Adam", "Alice", "Freya", "Callum")
foreach ($voice in $voices) {
    Write-Host "Testing $voice..."
    curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d "{`"message`":`"Hello, I am $voice`",`"voice_name`":`"$voice`"}"
    Start-Sleep -Seconds 3
}
```

### Test Windows SAPI Voices

```powershell
# Test each SAPI voice
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices()
foreach ($voice in $voices) {
    $name = $voice.VoiceInfo.Name
    Write-Host "Testing $name..."
    $synth.SelectVoice($name)
    $synth.Speak("Hello, I am $name")
}
```

---

## Quick Reference

**Start voice server:**
```powershell
C:\Users\$env:USERNAME\.claude\voice-server\start-voice-server.bat
```

**Stop voice server:**
```powershell
netstat -ano | findstr :8888
taskkill /PID <PID> /F
```

**Check server status:**
```powershell
curl http://localhost:8888/health
```

**Test notification:**
```powershell
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"test\"}'
```

**Edit configuration:**
```powershell
notepad C:\Users\$env:USERNAME\.claude\voice-server\server.windows.optimized.ts
```

**Edit environment:**
```powershell
notepad C:\Users\$env:USERNAME\.claude\.env
```

**File locations:**
- Voice server: `C:\Users\YourName\.claude\voice-server\server.windows.optimized.ts`
- Environment: `C:\Users\YourName\.claude\.env`
- Start script: `C:\Users\YourName\.claude\voice-server\start-voice-server.bat`

---

## You're All Set!

Your PAI voice system is configured with either:
- 🎙️ **ElevenLabs**: Natural, professional voices
- 🔊 **Windows SAPI**: Free, built-in voices

Every time Kai or an agent completes a task, you'll hear a voice notification in their distinct voice.

Enjoy your AI assistant with personality!

---

*Last updated: November 2025*
