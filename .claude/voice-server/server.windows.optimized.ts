#!/usr/bin/env bun
/**
 * PAIVoice - Personal AI Voice notification server for Windows
 * Modified from the original macOS version - OPTIMIZED VERSION
 * Uses eleven_monolingual_v1 model with economical settings
 */

import { serve } from "bun";
import { spawn } from "child_process";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";

// Load .env from user home directory
const envPath = join(homedir(), '.env');
// Also try loading from PAI directory as fallback
const paiEnvPath = process.env.PAI_DIR ? join(process.env.PAI_DIR, '.env') : null;

if (existsSync(envPath)) {
  console.log(`📂 Loading .env from ${envPath}`);
  const envContent = await Bun.file(envPath).text();
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
} else if (paiEnvPath && existsSync(paiEnvPath)) {
  console.log(`📂 Loading .env from ${paiEnvPath}`);
  const envContent = await Bun.file(paiEnvPath).text();
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
} else {
  console.log(`⚠️ No .env file found`);
}

const PORT = parseInt(process.env.PORT || "8888");
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  console.error('⚠️  ELEVENLABS_API_KEY not found in .env files');
  console.error('Add: ELEVENLABS_API_KEY=your_key_here');
}

// Default voice ID (Kai's voice - could be changed to a UK English voice)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "s3TPKV1kjDlVtZbl4Ksh";

// Sanitize input for shell commands
function sanitizeForShell(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s.,!?\-']/g, '').trim().substring(0, 500);
}

// Validate and sanitize user input
function validateInput(input: any): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Invalid input type' };
  }

  if (input.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }

  const dangerousPatterns = [
    /[;&|><`\$\(\)\{\}\[\]\\]/,
    /\.\.\//,
    /<script/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return { valid: false, error: 'Invalid characters in input' };
    }
  }

  return { valid: true };
}

// Generate speech using ElevenLabs API - OPTIMIZED VERSION
async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Limit the text length to reduce credit usage
  // Calculate a reasonable limit based on message length - longer messages get truncated more
  const maxLength = Math.min(100, Math.max(30, Math.floor(text.length * 0.7)));
  const shortenedText = text.length > maxLength ? 
      text.substring(0, maxLength) + "..." : 
      text;
  
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  console.log(`💰 Using economical settings with eleven_monolingual_v1 model`);
  console.log(`📏 Message length: ${text.length} chars → ${shortenedText.length} chars`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: shortenedText,
      model_id: 'eleven_monolingual_v1', // Using monolingual model for English
      voice_settings: {
        stability: 0.35,         // Lower stability = fewer credits
        similarity_boost: 0.35,  // Lower similarity = fewer credits
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return await response.arrayBuffer();
}

// Play audio using Windows Media Player
async function playAudio(audioBuffer: ArrayBuffer): Promise<void> {
  // Windows temp folder
  const tempFolder = process.env.TEMP || 'C:\\Windows\\Temp';
  const tempFile = join(tempFolder, `voice-${Date.now()}.mp3`);

  // Write audio to temp file
  await Bun.write(tempFile, audioBuffer);

  return new Promise((resolve, reject) => {
    console.log(`🔊 Playing audio file: ${tempFile}`);
    
    // Use PowerShell to play audio
    const command = `powershell -Command "(New-Object Media.SoundPlayer '${tempFile}').PlaySync()"`;
    
    const proc = spawn('cmd.exe', ['/c', command]);

    proc.on('error', (error) => {
      console.error('Error playing audio:', error);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        // Try to remove the temp file
        try {
          spawn('cmd.exe', ['/c', `del "${tempFile}"`]);
        } catch (e) {
          console.warn('Failed to delete temp file:', e);
        }
        resolve();
      } else {
        reject(new Error(`Audio player exited with code ${code}`));
      }
    });
  });
}

// Alternative: Use Windows built-in speech synthesis with UK accent if available
async function speakWindowsTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🔊 Using Windows TTS to speak: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    // Try to use a UK English voice if available
    const psScript = `
    Add-Type -AssemblyName System.Speech
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    
    # Try to use a UK English voice if available
    $ukVoices = $synth.GetInstalledVoices() | 
                Where-Object { $_.VoiceInfo.Culture.Name -like 'en-GB*' } | 
                Select-Object -First 1
    
    if ($ukVoices) {
        $synth.SelectVoice($ukVoices.VoiceInfo.Name)
        Write-Host "Using UK English voice: $($ukVoices.VoiceInfo.Name)"
    } else {
        Write-Host "No UK English voice found, using default voice"
    }
    
    $synth.Speak("${text.replace(/"/g, '\\"')}")
    `;
    
    const proc = spawn('powershell.exe', ['-Command', psScript]);

    proc.on('error', (error) => {
      console.error('Error using Windows TTS:', error);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Windows TTS exited with code ${code}`));
      }
    });
  });
}

// Credit estimation for messages
function estimateCredits(text: string): number {
  // Very rough estimation based on observed credit usage
  // ElevenLabs credits are approximately 1 credit per character
  return Math.ceil(text.length * 1.1); 
}

// Send Windows notification with voice
async function sendNotification(
  title: string,
  message: string,
  voiceEnabled = true,
  voiceId: string | null = null
) {
  // Validate inputs
  const titleValidation = validateInput(title);
  const messageValidation = validateInput(message);

  if (!titleValidation.valid) {
    throw new Error(`Invalid title: ${titleValidation.error}`);
  }

  if (!messageValidation.valid) {
    throw new Error(`Invalid message: ${messageValidation.error}`);
  }

  // Sanitize inputs
  const safeTitle = sanitizeForShell(title);
  const safeMessage = sanitizeForShell(message);

  // Generate and play voice
  if (voiceEnabled) {
    try {
      if (ELEVENLABS_API_KEY) {
        const voice = voiceId || DEFAULT_VOICE_ID;
        const estimatedCost = estimateCredits(safeMessage);
        console.log(`🎙️  Generating speech with ElevenLabs (voice: ${voice})`);
        console.log(`💲 Estimated cost: ~${estimatedCost} credits`);

        try {
          const audioBuffer = await generateSpeech(safeMessage, voice);
          await playAudio(audioBuffer);
        } catch (error) {
          console.error("ElevenLabs error, falling back to Windows TTS:", error);
          await speakWindowsTTS(safeMessage);
        }
      } else {
        // Fallback to Windows TTS if no API key
        await speakWindowsTTS(safeMessage);
      }
    } catch (error) {
      console.error("Failed to generate/play speech:", error);
    }
  }

  // Display Windows notification
  try {
    const psCommand = `
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.UI.Notifications.ToastNotification, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

    $template = @"
    <toast>
        <visual>
            <binding template="ToastText02">
                <text id="1">${safeTitle}</text>
                <text id="2">${safeMessage}</text>
            </binding>
        </visual>
    </toast>
"@

    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml($template)
    $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("PAI Voice Server").Show($toast)
    `;

    const psScript = `
    try {
        ${psCommand}
        [Console]::Error.WriteLine("Notification displayed successfully")
    } catch {
        [Console]::Error.WriteLine("Failed to show notification: $_")
    }
    `;

    spawn('powershell.exe', ['-Command', psScript]);
    
    console.log(`📣 Windows notification sent: "${safeTitle}" - "${safeMessage}"`);
  } catch (error) {
    console.error("Notification display error:", error);
  }
}

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Start HTTP server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    const clientIp = req.headers.get('x-forwarded-for') || 'localhost';

    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ status: "error", message: "Rate limit exceeded" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429
        }
      );
    }

    if (url.pathname === "/notify" && req.method === "POST") {
      try {
        const data = await req.json();
        const title = data.title || "PAI Notification";
        const message = data.message || "Task completed";
        const voiceEnabled = data.voice_enabled !== false;
        const voiceId = data.voice_id || data.voice_name || null; // Support both voice_id and voice_name

        if (voiceId && typeof voiceId !== 'string') {
          throw new Error('Invalid voice_id');
        }

        console.log(`📨 Notification: "${title}" - "${message}" (voice: ${voiceEnabled}, voiceId: ${voiceId || DEFAULT_VOICE_ID})`);

        await sendNotification(title, message, voiceEnabled, voiceId);

        return new Response(
          JSON.stringify({ status: "success", message: "Notification sent" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      } catch (error: any) {
        console.error("Notification error:", error);
        return new Response(
          JSON.stringify({ status: "error", message: error.message || "Internal server error" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error.message?.includes('Invalid') ? 400 : 500
          }
        );
      }
    }

    if (url.pathname === "/pai" && req.method === "POST") {
      try {
        const data = await req.json();
        const title = data.title || "PAI Assistant";
        const message = data.message || "Task completed";

        console.log(`🤖 PAI notification: "${title}" - "${message}"`);

        await sendNotification(title, message, true, null);

        return new Response(
          JSON.stringify({ status: "success", message: "PAI notification sent" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      } catch (error: any) {
        console.error("PAI notification error:", error);
        return new Response(
          JSON.stringify({ status: "error", message: error.message || "Internal server error" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error.message?.includes('Invalid') ? 400 : 500
          }
        );
      }
    }

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          port: PORT,
          voice_system: "ElevenLabs (Optimized) with Windows TTS fallback",
          default_voice_id: DEFAULT_VOICE_ID,
          api_key_configured: !!ELEVENLABS_API_KEY,
          platform: "Windows",
          model: "eleven_monolingual_v1"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    return new Response("PAIVoice Server for Windows (Optimized Edition) - POST to /notify or /pai", {
      headers: corsHeaders,
      status: 200
    });
  },
});

console.log(`🚀 PAIVoice Server (OPTIMIZED VERSION) running on port ${PORT}`);
console.log(`🎙️  Using ElevenLabs TTS with eleven_monolingual_v1 model (default voice: ${DEFAULT_VOICE_ID})`);
console.log(`💰 Using reduced credit settings to minimize token usage`);
console.log(`🇬🇧 Attempting to use UK English voices where available`);
console.log(`🔄 Fallback to Windows TTS if ElevenLabs fails`);
console.log(`📡 POST to http://localhost:${PORT}/notify`);
console.log(`🔒 Security: CORS restricted to localhost, rate limiting enabled`);
console.log(`🔑 API Key: ${ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Missing'}`);
