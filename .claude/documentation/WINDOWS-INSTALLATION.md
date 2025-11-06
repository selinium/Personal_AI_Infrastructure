# Windows Installation Guide for PAI

**Complete setup guide for running PAI on Windows 11 with Claude Code**

This guide reflects what actually works best on Windows based on real-world testing. It focuses on the simplest, most reliable approach.

---

## What You'll Set Up

- **PAI Repository**: Your copy of the PAI codebase at `C:\Users\YourName\PAI\`
- **Working System**: Your personal PAI instance at `C:\Users\YourName\.claude\`
- **CLAUDE.md**: Simple configuration file in your home directory
- **Voice Server**: Windows-optimized voice notifications (optional)

---

## Prerequisites

Before starting, you need:

### 1. Windows 11
- **Version**: Windows 11 (any edition)
- **Check**: Press Win+R, type `winver`, press Enter

### 2. Git for Windows
- **What**: Version control system for downloading PAI
- **Check**: Open PowerShell and run: `git --version`
- **Install**: Download from [git-scm.com](https://git-scm.com/download/win)
- **Installation tip**: Use default settings, but select "Use Windows' default console window"

### 3. Bun (JavaScript Runtime)
- **What**: Fast JavaScript runtime (like Node.js but better)
- **Why**: Powers the voice server and PAI tools
- **Check**: Open PowerShell and run: `bun --version`
- **Install**:
  ```powershell
  # Run in PowerShell (as Administrator)
  irm bun.sh/install.ps1 | iex
  ```
- **Verify**: Close and reopen PowerShell, then run `bun --version`

### 4. Claude Code
- **What**: AI assistant interface that works with PAI
- **Get it**: Visit [claude.ai/code](https://claude.ai/code)
- **Sign in**: Use your Anthropic account
- **Note**: Claude Code is free to use with Claude AI

---

## Installation Steps

### Step 1: Download PAI

Open PowerShell and run:

```powershell
# Navigate to your home directory
cd ~

# Clone PAI repository
git clone https://github.com/danielmiessler/Personal_AI_Infrastructure.git PAI

# Verify download
cd PAI
ls
```

**What you should see:**
```
.claude/          # All PAI infrastructure lives here
README.md
LICENSE
.gitignore
```

The PAI repository now uses a `.claude/` directory structure that mirrors your actual working system.

---

### Step 2: Copy PAI to Your Working Directory

**Important**: Keep the repository and working copy separate.

```powershell
# Copy .claude directory to your user directory
cp -r .\.claude\* C:\Users\$env:USERNAME\.claude\

# Verify the copy
ls C:\Users\$env:USERNAME\.claude\
```

**What you should see:**
```
agents/
commands/
documentation/
hooks/
skills/
voice-server/
settings.json
```

**Why separate?**
- Repository: Clean reference copy for updates
- Working system: Your personalized instance with sensitive data
- **Never commit personal data to the public repository**

---

### Step 3: Set Up Environment Variables (Optional)

Environment variables make it easier to reference PAI paths, but they're optional on Windows.

**Option A: PowerShell Profile (Persistent)**

```powershell
# Open your PowerShell profile
notepad $PROFILE

# Add these lines:
$env:PAI_DIR = "C:\Users\$env:USERNAME\PAI"
$env:PAI_HOME = $env:USERPROFILE

# Save and close notepad, then reload:
. $PROFILE
```

**Option B: System Environment Variables (Recommended)**

1. Press Win+R, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab
3. Click "Environment Variables"
4. Under "User variables", click "New"
5. Add:
   - Variable: `PAI_DIR`
   - Value: `C:\Users\YourName\PAI` (replace YourName with your username)
6. Click "New" again and add:
   - Variable: `PAI_HOME`
   - Value: `C:\Users\YourName`
7. Click OK to save

---

### Step 4: Create CLAUDE.md Configuration

**This is the key to Windows success.** Instead of using hooks (which can be complicated), use a simple `CLAUDE.md` file in your home directory.

```powershell
# Create CLAUDE.md in your home directory
notepad C:\Users\$env:USERNAME\CLAUDE.md
```

**Paste this template:**

```markdown
# Kai - Your Personal AI Assistant

You are Kai, a personal AI assistant running on Windows.

## Identity
- **Name**: Kai
- **Role**: Personal AI assistant and digital companion
- **Personality**: Friendly, professional, and direct
- **Language**: Use UK English spelling and grammar

## Technical Preferences
- **Primary Languages**: TypeScript, Python
- **Package Managers**: Bun for JavaScript/TypeScript, UV for Python
- **Operating System**: Windows 11
- **Shell**: PowerShell
- **Working Directory**: C:\Users\YourName\
- **PAI Repository**: C:\Users\YourName\PAI\
- **PAI Working System**: C:\Users\YourName\.claude\
- **File Paths**: Always use Windows-style paths with backslashes

## Critical Security Rules
- **NEVER COMMIT FROM WRONG DIRECTORY** - Run `git remote -v` BEFORE every commit
- **C:\Users\YourName\.claude\ CONTAINS SENSITIVE PRIVATE DATA** - NEVER commit to public repos
- **C:\Users\YourName\PAI\** - This is the PAI repository. Only commit PAI-related changes here

## Response Style
- Use natural, conversational UK English
- Keep responses concise and direct
- Use minimal formatting

## Notes
- You can be updated by editing this CLAUDE.md file
- For more context about PAI, see C:\Users\YourName\.claude\skills\PAI\SKILL.md
```

**Save the file** (Ctrl+S) and close Notepad.

**Why CLAUDE.md?**
- Simple: One file to edit
- Reliable: Claude Code reads it automatically
- No hooks required: Avoids complexity
- Easy to update: Just edit the file

---

### Step 5: Configure API Keys (Optional)

Some PAI features require API keys. Create a `.env` file in your `.claude` directory.

```powershell
# Copy the example file
cp C:\Users\$env:USERNAME\.claude\.env.example C:\Users\$env:USERNAME\.claude\.env

# Edit it
notepad C:\Users\$env:USERNAME\.claude\.env
```

**Add your API keys (if you have them):**

```env
# Research agents (optional)
PERPLEXITY_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here

# AI generation (optional)
REPLICATE_API_TOKEN=your_token_here
OPENAI_API_KEY=your_key_here

# Voice server (optional - for ElevenLabs)
ELEVENLABS_API_KEY=your_key_here

# System
PORT=8888
```

**Note**: PAI works without API keys - they just unlock additional features.

---

### Step 6: Voice Server Setup (Optional)

**Do you want voice notifications?** This is completely optional.

**Best Windows Voice Server**: `server.windows.optimized.ts`

After testing all options, this is the one that works best on Windows:
- Uses ElevenLabs for high-quality voices (requires API key)
- Falls back to Windows SAPI if no key configured
- Optimized for Windows 11
- Runs efficiently in background

**Setup:**

```powershell
# Navigate to voice server directory
cd C:\Users\$env:USERNAME\.claude\voice-server

# Install dependencies
bun install

# Test the server manually
bun server.windows.optimized.ts

# You should see:
# 🚀 PAI Voice Server running on port 8888
```

**Start voice server automatically:**

The batch file has been created for you:

```powershell
# Run this whenever you want voice notifications
C:\Users\$env:USERNAME\.claude\voice-server\start-voice-server.bat
```

**To test:**

```powershell
# Check server health
curl http://localhost:8888/health

# Send a test notification
curl -X POST http://localhost:8888/notify -H "Content-Type: application/json" -d '{\"message\":\"Voice server working!\"}'
```

See [VOICE-SETUP-WINDOWS.md](./VOICE-SETUP-WINDOWS.md) for detailed voice configuration.

---

### Step 7: Restart Claude Code

1. Close Claude Code completely
2. Reopen Claude Code
3. Claude Code will automatically read your `CLAUDE.md` file
4. Start a conversation to verify it's working

**Test it:**

```
"Hey Kai, tell me about yourself"
```

Kai should respond with awareness of being your personal AI assistant on Windows!

---

## Updating PAI

To update PAI to the latest version, you need to pull changes from the repository and then sync them to your working directory.

**Simple batch file approach** (create this for easy updates):

Create `C:\Users\YourName\update-pai.bat`:

```batch
@echo off
echo Updating PAI from GitHub...

REM Navigate to PAI repository
cd C:\Users\%USERNAME%\PAI

REM Check we're in the right place
git remote -v

REM Pull latest changes
git pull origin main

echo.
echo Repository updated! Now syncing to working directory...

REM Copy updated files to working directory
robocopy .\.claude C:\Users\%USERNAME%\.claude /E /XF .env /XD scratchpad

echo.
echo Update complete!
echo Note: Your .env file and scratchpad directory were preserved.
pause
```

**Usage:**

```powershell
# Double-click the batch file, or run:
C:\Users\$env:USERNAME\update-pai.bat
```

**What it does:**
1. Verifies you're in the PAI repository
2. Pulls latest changes from GitHub
3. Syncs changes to your working directory
4. Preserves your `.env` file and personal data

---

## Important: No Symlinks on Windows

**Symlinks cause confusion on Windows.** Don't use them for PAI.

**Why?**
- Require administrator privileges
- Can break with Windows updates
- Confuse file permissions
- Make it unclear which file you're editing

**Instead:**
- Keep repository and working copy separate
- Use the update script to sync changes
- Edit files in `.claude\` (your working directory)
- Keep the repository clean for pulling updates

**If you have symlinks:** Remove them and use real copies instead.

---

## File Structure

**PAI Repository** (`C:\Users\YourName\PAI\`):
```
PAI/
├── .claude/              # All PAI infrastructure
│   ├── agents/          # Specialized AI agents
│   ├── commands/        # Custom commands
│   ├── documentation/   # Help files
│   ├── hooks/           # Automation (advanced)
│   ├── skills/          # Capabilities modules
│   ├── voice-server/    # Voice notifications
│   ├── settings.json    # Claude Code settings
│   └── .env.example     # Environment template
├── README.md            # Repository documentation
└── LICENSE
```

**Working System** (`C:\Users\YourName\.claude\`):
```
.claude/
├── agents/              # Your working agents
├── commands/            # Your working commands
├── documentation/       # Your working docs
├── hooks/               # Your working hooks
├── skills/              # Your working skills
│   └── PAI/            # Main PAI skill
├── voice-server/        # Your working voice server
│   ├── server.windows.optimized.ts  # Best for Windows
│   └── start-voice-server.bat       # Easy start script
├── settings.json        # Your Claude Code settings
├── .env                 # Your API keys (NEVER commit!)
└── scratchpad/          # Your temporary work area
```

**Configuration** (`C:\Users\YourName\CLAUDE.md`):
- Your main configuration file
- Claude Code reads this automatically
- Simple to edit and update

---

## Management Scripts

### Start Voice Server

`C:\Users\YourName\.claude\voice-server\start-voice-server.bat`

Already created for you. Starts the voice server in the background.

### Update PAI

`C:\Users\YourName\update-pai.bat`

Create this using the script from Step "Updating PAI" above.

### Stop Voice Server

Create `C:\Users\YourName\stop-voice-server.bat`:

```batch
@echo off
echo Stopping PAI Voice Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8888') do taskkill /PID %%a /F
echo Voice server stopped.
pause
```

---

## Troubleshooting

### Claude Code doesn't recognize Kai

**Check:**
1. Does `C:\Users\YourName\CLAUDE.md` exist?
2. Open the file - is it properly formatted?
3. Restart Claude Code completely
4. Start a new conversation

### Voice server won't start

**Check:**
1. Is Bun installed? Run: `bun --version`
2. Is port 8888 in use? Run: `netstat -ano | findstr :8888`
3. If port is in use, stop the existing process:
   ```powershell
   # Find the PID from the netstat output, then:
   taskkill /PID <number> /F
   ```
4. Try starting again

### Git pull fails

**Error**: "Please commit your changes or stash them"

**Solution:**
```powershell
cd C:\Users\$env:USERNAME\PAI
git status  # See what changed
git stash   # Temporarily store changes
git pull    # Update from GitHub
git stash pop  # Restore your changes (if needed)
```

### Bun command not found

**Solution:**
1. Close PowerShell completely
2. Reopen PowerShell
3. Try `bun --version` again
4. If still fails, reinstall Bun:
   ```powershell
   irm bun.sh/install.ps1 | iex
   ```

### Environment variables not working

**Check:**
```powershell
# Test the variables
echo $env:PAI_DIR
echo $env:PAI_HOME
```

If empty, you need to set them again using System Environment Variables (see Step 3, Option B).

---

## What's Next?

### 1. Explore Skills (5 minutes)

```powershell
# See available skills
ls C:\Users\$env:USERNAME\.claude\skills\
```

Each skill is a capability module. Check out:
- `research` - Multi-source research
- `fabric` - 242+ AI patterns
- `create-skill` - Make your own skills

### 2. Customize Your CLAUDE.md (10 minutes)

```powershell
notepad C:\Users\$env:USERNAME\CLAUDE.md
```

Add:
- Your name and preferences
- Your contacts
- Your tech stack preferences
- Your voice preferences

### 3. Read the Documentation (30 minutes)

- [Architecture](./architecture.md) - How PAI works
- [Skills System](./skills-system.md) - Understanding skills
- [Voice Setup](./VOICE-SETUP-WINDOWS.md) - Detailed voice configuration

---

## Quick Reference

**Essential Commands:**

```powershell
# Check PAI environment
echo $env:PAI_DIR

# Navigate to PAI
cd $env:PAI_DIR

# Navigate to working directory
cd C:\Users\$env:USERNAME\.claude

# Update PAI
cd C:\Users\$env:USERNAME\PAI
git pull
robocopy .\.claude C:\Users\$env:USERNAME\.claude /E /XF .env

# Start voice server
C:\Users\$env:USERNAME\.claude\voice-server\start-voice-server.bat

# Stop voice server
netstat -ano | findstr :8888
# Then: taskkill /PID <number> /F

# Edit configuration
notepad C:\Users\$env:USERNAME\CLAUDE.md

# View skills
ls C:\Users\$env:USERNAME\.claude\skills\
```

**File Locations:**

| What | Where |
|------|-------|
| PAI Repository | `C:\Users\YourName\PAI\` |
| Working System | `C:\Users\YourName\.claude\` |
| Configuration | `C:\Users\YourName\CLAUDE.md` |
| API Keys | `C:\Users\YourName\.claude\.env` |
| Voice Server | `C:\Users\YourName\.claude\voice-server\` |
| Skills | `C:\Users\YourName\.claude\skills\` |
| Commands | `C:\Users\YourName\.claude\commands\` |
| Scratchpad | `C:\Users\YourName\.claude\scratchpad\` |

---

## You're All Set!

Your Personal AI Infrastructure is now running on Windows with:

- ✅ Clean repository structure
- ✅ Separate working directory
- ✅ Simple CLAUDE.md configuration (no complicated hooks!)
- ✅ Proper update workflow
- ✅ Optional voice notifications
- ✅ No symlinks to cause problems

**Welcome to PAI on Windows!**

---

*Built with ❤️ by [Daniel Miessler](https://danielmiessler.com) and the PAI community*

*Windows guide last updated: November 2025*
