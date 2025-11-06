# Windows Management Scripts for PAI

**Simple batch and PowerShell scripts for managing PAI on Windows**

These scripts make it easy to manage your PAI installation without memorising commands.

---

## Overview

After testing various approaches, we've found that simple batch files work best on Windows for PAI management. No symlinks needed, no VBScript complexity - just straightforward scripts that work.

---

## Core Management Scripts

### 1. Update PAI (`update-pai.bat`)

**Purpose**: Updates your PAI installation from GitHub and syncs to your working directory.

**Location**: Create at `C:\Users\YourName\update-pai.bat`

```batch
@echo off
echo ================================================
echo  PAI Update Script
echo ================================================
echo.

REM Navigate to PAI repository
cd /d C:\Users\%USERNAME%\PAI

echo Checking repository location...
git remote -v

echo.
echo Pulling latest changes from GitHub...
git pull origin main

if errorlevel 1 (
    echo.
    echo ERROR: Git pull failed!
    echo This might happen if you have uncommitted changes.
    echo.
    echo Options:
    echo 1. Commit your changes: git commit -am "your message"
    echo 2. Stash your changes: git stash
    echo 3. Discard your changes: git reset --hard origin/main
    echo.
    pause
    exit /b 1
)

echo.
echo Repository updated successfully!
echo.
echo Syncing to working directory...
echo This preserves your .env file and scratchpad...

REM Copy updated files to working directory
REM /E = Copy subdirectories including empty ones
REM /XF = Exclude files (.env, secrets, etc.)
REM /XD = Exclude directories (scratchpad, sensitive data)
robocopy ".\.claude" "C:\Users\%USERNAME%\.claude" /E /XF .env .env.local secrets.json /XD scratchpad /NFL /NDL /NJH /NJS /nc /ns /np

echo.
echo ================================================
echo  Update Complete!
echo ================================================
echo.
echo Your .env file and scratchpad were preserved.
echo Restart Claude Code to use the latest version.
echo.
pause
```

**Usage:**
```powershell
# Double-click the file, or run:
C:\Users\$env:USERNAME\update-pai.bat
```

**What it does:**
1. Navigates to your PAI repository
2. Shows the remote URL (verifies you're in the right place)
3. Pulls latest changes from GitHub
4. Syncs changes to your working directory at `C:\Users\YourName\.claude\`
5. Preserves your `.env` file and `scratchpad` directory
6. Shows clear error messages if something goes wrong

---

### 2. Start Voice Server (`start-voice-server.bat`)

**Purpose**: Starts the voice server in the background.

**Location**: Already created at `C:\Users\YourName\.claude\voice-server\start-voice-server.bat`

```batch
@echo off
REM PAI Voice Server - Optimized Version
REM Starts the Windows-optimized voice server with ElevenLabs/SAPI

echo Starting PAI Voice Server...
cd /d C:\Users\%USERNAME%\.claude\voice-server

REM Start the server in a new window that closes automatically
start "PAI Voice Server" bun server.windows.optimized.ts

echo.
echo Voice server started in background
echo Check http://localhost:8888/health to verify
echo.
timeout /t 3
```

**Usage:**
```powershell
# Double-click, or run:
C:\Users\$env:USERNAME\.claude\voice-server\start-voice-server.bat
```

**What it does:**
1. Navigates to the voice server directory
2. Starts `server.windows.optimized.ts` using Bun
3. Runs in the background
4. Shows confirmation message

---

### 3. Stop Voice Server (`stop-voice-server.bat`)

**Purpose**: Stops the running voice server.

**Location**: Create at `C:\Users\YourName\stop-voice-server.bat`

```batch
@echo off
echo ================================================
echo  Stopping PAI Voice Server
echo ================================================
echo.

echo Looking for voice server on port 8888...
netstat -ano | findstr :8888

if errorlevel 1 (
    echo.
    echo No voice server found running on port 8888.
    echo.
    pause
    exit /b 0
)

echo.
echo Stopping voice server...

REM Find and kill all processes using port 8888
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8888') do (
    echo Killing process ID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ================================================
echo  Voice Server Stopped
echo ================================================
echo.
pause
```

**Usage:**
```powershell
# Double-click, or run:
C:\Users\$env:USERNAME\stop-voice-server.bat
```

**What it does:**
1. Checks if voice server is running on port 8888
2. If found, kills the process
3. Shows confirmation message

---

### 4. PAI Status Check (`pai-status.bat`)

**Purpose**: Checks the status of your PAI installation.

**Location**: Create at `C:\Users\YourName\pai-status.bat`

```batch
@echo off
echo ================================================
echo  PAI System Status
echo ================================================
echo.

REM Check PAI directory
echo [1/7] Checking PAI Repository...
if exist "C:\Users\%USERNAME%\PAI\.git" (
    echo ✓ PAI repository found at C:\Users\%USERNAME%\PAI
) else (
    echo ✗ PAI repository NOT found at C:\Users\%USERNAME%\PAI
)

REM Check working directory
echo.
echo [2/7] Checking Working Directory...
if exist "C:\Users\%USERNAME%\.claude\skills" (
    echo ✓ Working directory found at C:\Users\%USERNAME%\.claude
) else (
    echo ✗ Working directory NOT found at C:\Users\%USERNAME%\.claude
)

REM Check CLAUDE.md
echo.
echo [3/7] Checking Configuration...
if exist "C:\Users\%USERNAME%\CLAUDE.md" (
    echo ✓ CLAUDE.md found at C:\Users\%USERNAME%\CLAUDE.md
) else (
    echo ✗ CLAUDE.md NOT found at C:\Users\%USERNAME%\CLAUDE.md
)

REM Check .env file
echo.
echo [4/7] Checking Environment File...
if exist "C:\Users\%USERNAME%\.claude\.env" (
    echo ✓ .env file found at C:\Users\%USERNAME%\.claude\.env
) else (
    echo ✗ .env file NOT found - API keys not configured
)

REM Check Bun installation
echo.
echo [5/7] Checking Bun Installation...
bun --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Bun NOT installed or not in PATH
) else (
    echo ✓ Bun installed:
    bun --version
)

REM Check Git installation
echo.
echo [6/7] Checking Git Installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Git NOT installed or not in PATH
) else (
    echo ✓ Git installed:
    git --version
)

REM Check voice server
echo.
echo [7/7] Checking Voice Server...
curl -s http://localhost:8888/health >nul 2>&1
if errorlevel 1 (
    echo ✗ Voice server NOT running on port 8888
) else (
    echo ✓ Voice server is running on port 8888
)

echo.
echo ================================================
echo  Status Check Complete
echo ================================================
echo.
pause
```

**Usage:**
```powershell
# Double-click, or run:
C:\Users\$env:USERNAME\pai-status.bat
```

**What it checks:**
1. PAI repository location
2. Working directory (`.claude`)
3. CLAUDE.md configuration file
4. `.env` file
5. Bun installation
6. Git installation
7. Voice server status

---

### 5. Clean PAI Scratchpad (`clean-scratchpad.bat`)

**Purpose**: Cleans up old temporary files from the scratchpad.

**Location**: Create at `C:\Users\YourName\clean-scratchpad.bat`

```batch
@echo off
echo ================================================
echo  PAI Scratchpad Cleanup
echo ================================================
echo.

cd /d C:\Users\%USERNAME%\.claude\scratchpad

echo Current scratchpad contents:
echo.
dir /b /ad
echo.

set /p CONFIRM="Delete all scratchpad contents? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo.
    echo Cancelled - nothing deleted.
    pause
    exit /b 0
)

echo.
echo Deleting scratchpad contents...
for /d %%d in (*) do (
    echo Removing: %%d
    rd /s /q "%%d"
)

echo.
echo ================================================
echo  Scratchpad Cleaned
echo ================================================
echo.
pause
```

**Usage:**
```powershell
# Double-click, or run:
C:\Users\$env:USERNAME\clean-scratchpad.bat
```

**What it does:**
1. Lists all scratchpad directories
2. Asks for confirmation
3. Deletes all subdirectories in scratchpad
4. Keeps the scratchpad directory itself

---

## PowerShell Management Scripts

For users who prefer PowerShell scripts (.ps1) over batch files:

### Update PAI (PowerShell) (`update-pai.ps1`)

**Location**: Create at `C:\Users\YourName\update-pai.ps1`

```powershell
#!/usr/bin/env pwsh

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " PAI Update Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to PAI repository
$paiDir = "C:\Users\$env:USERNAME\PAI"
Set-Location $paiDir

Write-Host "Checking repository location..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "Pulling latest changes from GitHub..." -ForegroundColor Yellow

try {
    git pull origin main

    if ($LASTEXITCODE -ne 0) {
        throw "Git pull failed"
    }

    Write-Host ""
    Write-Host "Repository updated successfully!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "ERROR: Git pull failed!" -ForegroundColor Red
    Write-Host "This might happen if you have uncommitted changes." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Commit your changes: git commit -am 'your message'"
    Write-Host "2. Stash your changes: git stash"
    Write-Host "3. Discard your changes: git reset --hard origin/main"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Syncing to working directory..." -ForegroundColor Yellow
Write-Host "This preserves your .env file and scratchpad..." -ForegroundColor Gray

# Use robocopy for reliable file copying
$source = ".\.claude"
$destination = "C:\Users\$env:USERNAME\.claude"

$result = robocopy $source $destination /E /XF .env .env.local secrets.json /XD scratchpad /NFL /NDL /NJH /NJS /nc /ns /np

# Robocopy exit codes: 0-7 are success, 8+ are errors
if ($LASTEXITCODE -ge 8) {
    Write-Host ""
    Write-Host "ERROR: Failed to sync files!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host " Update Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your .env file and scratchpad were preserved." -ForegroundColor Gray
Write-Host "Restart Claude Code to use the latest version." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
```

**Usage:**
```powershell
# Run in PowerShell:
C:\Users\$env:USERNAME\update-pai.ps1

# Or right-click and select "Run with PowerShell"
```

**Note**: First time running PowerShell scripts, you may need to enable script execution:

```powershell
# Run as Administrator, then:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Advanced Scripts

### Backup PAI Configuration (`backup-pai.bat`)

**Purpose**: Creates a backup of your PAI configuration and sensitive files.

**Location**: Create at `C:\Users\YourName\backup-pai.bat`

```batch
@echo off
echo ================================================
echo  PAI Configuration Backup
echo ================================================
echo.

REM Create backup directory with timestamp
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=C:\Users\%USERNAME%\PAI-Backups\backup_%TIMESTAMP%

echo Creating backup directory...
mkdir "%BACKUP_DIR%"

echo Backing up configuration files...

REM Backup CLAUDE.md
if exist "C:\Users\%USERNAME%\CLAUDE.md" (
    copy "C:\Users\%USERNAME%\CLAUDE.md" "%BACKUP_DIR%\CLAUDE.md" >nul
    echo ✓ CLAUDE.md
)

REM Backup .env
if exist "C:\Users\%USERNAME%\.claude\.env" (
    copy "C:\Users\%USERNAME%\.claude\.env" "%BACKUP_DIR%\.env" >nul
    echo ✓ .env
)

REM Backup settings.json
if exist "C:\Users\%USERNAME%\.claude\settings.json" (
    copy "C:\Users\%USERNAME%\.claude\settings.json" "%BACKUP_DIR%\settings.json" >nul
    echo ✓ settings.json
)

REM Backup custom skills
if exist "C:\Users\%USERNAME%\.claude\skills\custom" (
    robocopy "C:\Users\%USERNAME%\.claude\skills\custom" "%BACKUP_DIR%\skills-custom" /E /NFL /NDL /NJH /NJS >nul
    echo ✓ Custom skills
)

REM Backup custom commands
if exist "C:\Users\%USERNAME%\.claude\commands\custom" (
    robocopy "C:\Users\%USERNAME%\.claude\commands\custom" "%BACKUP_DIR%\commands-custom" /E /NFL /NDL /NJH /NJS >nul
    echo ✓ Custom commands
)

echo.
echo ================================================
echo  Backup Complete!
echo ================================================
echo.
echo Backup location: %BACKUP_DIR%
echo.
pause
```

---

## Installation

### Option 1: Download and Run

1. Create each script file in your home directory
2. Copy the script content
3. Paste into Notepad
4. Save with the `.bat` or `.ps1` extension
5. Double-click to run

### Option 2: Create All Scripts at Once

Create `C:\Users\YourName\install-pai-scripts.bat`:

```batch
@echo off
echo Installing PAI management scripts...

REM Create update-pai.bat
(
echo @echo off
echo echo Updating PAI...
echo cd /d C:\Users\%%USERNAME%%\PAI
echo git remote -v
echo git pull origin main
echo echo Syncing to working directory...
echo robocopy ".\.claude" "C:\Users\%%USERNAME%%\.claude" /E /XF .env /XD scratchpad /NFL /NDL /NJH /NJS
echo echo Update complete!
echo pause
) > C:\Users\%USERNAME%\update-pai.bat

REM Create stop-voice-server.bat
(
echo @echo off
echo echo Stopping PAI Voice Server...
echo for /f "tokens=5" %%%%a in ('netstat -aon ^^| findstr :8888'^) do taskkill /PID %%%%a /F
echo echo Voice server stopped.
echo pause
) > C:\Users\%USERNAME%\stop-voice-server.bat

REM Create pai-status.bat
(
echo @echo off
echo echo PAI System Status
echo echo Checking installation...
echo if exist "C:\Users\%%USERNAME%%\PAI\.git" echo ✓ PAI repository found
echo if exist "C:\Users\%%USERNAME%%\.claude\skills" echo ✓ Working directory found
echo if exist "C:\Users\%%USERNAME%%\CLAUDE.md" echo ✓ CLAUDE.md found
echo bun --version 2^>nul ^&^& echo ✓ Bun installed
echo git --version 2^>nul ^&^& echo ✓ Git installed
echo curl -s http://localhost:8888/health 2^>nul ^&^& echo ✓ Voice server running
echo pause
) > C:\Users\%USERNAME%\pai-status.bat

echo.
echo Scripts installed at:
echo - C:\Users\%USERNAME%\update-pai.bat
echo - C:\Users\%USERNAME%\stop-voice-server.bat
echo - C:\Users\%USERNAME%\pai-status.bat
echo.
pause
```

Run this installer, and it will create all the basic scripts for you.

---

## Tips and Best Practices

### 1. Create Desktop Shortcuts

For frequently used scripts:

1. Right-click the script file
2. Select "Send to" → "Desktop (create shortcut)"
3. Rename the shortcut (remove `.bat` from the name)
4. Optional: Change the icon (right-click → Properties → Change Icon)

### 2. Add to Start Menu

1. Press Win+R, type `shell:startup`, press Enter
2. Create shortcuts to your scripts in this folder
3. They'll run at Windows startup

### 3. Use a Scripts Folder

Keep all PAI scripts organized:

```batch
mkdir C:\Users\%USERNAME%\PAI-Scripts
```

Then create all scripts in this folder.

### 4. Regular Backups

Run the backup script weekly:

```powershell
# In Windows Task Scheduler, create a weekly task that runs:
C:\Users\%USERNAME%\backup-pai.bat
```

### 5. Test Before Using

Always test scripts with safe operations first:

```batch
REM Add this to test mode
echo [TEST MODE] Would update PAI repository
echo [TEST MODE] Would sync to working directory
pause
exit /b 0
```

---

## Troubleshooting

### Scripts Won't Run

**Error**: "Windows cannot find the file"

**Solution**:
- Make sure the file has the `.bat` extension
- Check that the path is correct
- Try right-clicking and selecting "Run as administrator"

### Permission Errors

**Error**: "Access denied" or "Permission denied"

**Solution**:
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Robocopy Errors

**Error**: Robocopy fails to copy files

**Solution**:
- Check that both source and destination exist
- Make sure you're not trying to copy to a restricted location
- Try running the script as administrator

### Git Errors in Update Script

**Error**: "Cannot pull with uncommitted changes"

**Solution**:
```powershell
cd C:\Users\$env:USERNAME\PAI
git status  # See what changed
git stash   # Temporarily save changes
git pull    # Update from GitHub
```

---

## Quick Reference

**Essential Scripts:**

| Script | Purpose | Location |
|--------|---------|----------|
| `update-pai.bat` | Update PAI from GitHub | `C:\Users\YourName\` |
| `start-voice-server.bat` | Start voice server | `C:\Users\YourName\.claude\voice-server\` |
| `stop-voice-server.bat` | Stop voice server | `C:\Users\YourName\` |
| `pai-status.bat` | Check system status | `C:\Users\YourName\` |
| `clean-scratchpad.bat` | Clean temp files | `C:\Users\YourName\` |
| `backup-pai.bat` | Backup configuration | `C:\Users\YourName\` |

**Script Templates:**

All script templates are available in this document. Copy and paste them into new files with the appropriate names.

---

## You're All Set!

With these management scripts, you can easily:

- ✅ Update PAI with one click
- ✅ Manage the voice server
- ✅ Check system status
- ✅ Clean up temporary files
- ✅ Backup your configuration

No need to remember complex commands or worry about breaking things!

---

*Last updated: November 2025*
