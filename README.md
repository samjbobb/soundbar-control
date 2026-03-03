# Soundbar Control

CLI tool and Node-RED integration for controlling a Sennheiser AMBEO soundbar via its HTTP API.

## Compatibility

**Tested with:**
- Sennheiser AMBEO Soundbar Plus (Model: sb02M)

**May work with:**
- Other Sennheiser AMBEO soundbar models (untested)

## Features

- Check current soundbar status (mode, input, Ambeo 3D, voice enhancement, night mode)
- Manually toggle individual settings
- Automatic configuration based on input source:
  - **TV/HDMI input** → Movie mode, Ambeo 3D enabled, voice enhancement enabled
  - **Music sources** (AirPlay/Spotify/Bluetooth) → Music mode, Ambeo and voice disabled

## Installation

```bash
pnpm install
```

## Usage

### CLI Commands

**Check status:**
```bash
pnpm dev status
```

**Automatic configuration (recommended):**
```bash
pnpm dev auto
```

**Manual controls:**
```bash
pnpm dev mode <movie|music|adaptive>  # Set audio mode
pnpm dev ambeo <on|off>                # Toggle Ambeo 3D
pnpm dev voice <on|off>                # Toggle voice enhancement
pnpm dev night <on|off>                # Toggle night mode
```

**Custom soundbar IP:**
```bash
pnpm dev --host 192.168.1.XXX status
```

### Build for production

```bash
pnpm build
pnpm start status
```

## API Overview

The soundbar exposes an HTTP API with no authentication required:

- **Get data:** `GET /api/getData?path=<path>&roles=<roles>`
- **Set data:** `GET /api/setData?path=<path>&role=value&value=<json>`

Key endpoints:
- Audio preset: `settings:/popcorn/audio/audioPresets/audioPreset`
- Current input: `player:player/data/value`
- Ambeo status: `settings:/popcorn/audio/ambeoModeStatus`
- Voice enhancement: `settings:/popcorn/audio/voiceEnhancement`
- Night mode: `settings:/popcorn/audio/nightModeStatus`

## Example Output

```
=== Soundbar Status ===

Audio Mode:         MOVIE
Current Input:      HDMI TV (HDMI)
Ambeo 3D:           ON
Night Mode:         OFF
Voice Enhancement:  ON
```
