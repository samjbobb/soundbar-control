#!/usr/bin/env node

import { Command } from "commander";
import { SoundbarAPI } from "./api.js";

const program = new Command();

program
  .name("soundbar")
  .description("CLI tool to control your Sennheiser Ambeo soundbar")
  .version("1.0.0")
  .option("--host <host>", "Soundbar IP address", "192.168.1.119");

// Status command
program
  .command("status")
  .description("Show current soundbar status")
  .action(async () => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);

    console.log("\n=== Soundbar Status ===\n");

    try {
      const preset = await api.getAudioPreset();
      const mode = preset?.value?.popcornAudioPreset || "unknown";
      console.log(`Audio Mode:         ${mode.toUpperCase()}`);
    } catch (e) {
      console.log(`Audio Mode:         Error - ${e}`);
    }

    try {
      const input = await api.getCurrentInput();
      const inputName = input?.[0]?.playLogicData?.mediaRoles?.title || "unknown";
      const serviceId = input?.[0]?.playLogicData?.mediaRoles?.mediaData?.metaData?.serviceID || "unknown";
      console.log(`Current Input:      ${inputName} (${serviceId})`);
    } catch (e) {
      console.log(`Current Input:      Error - ${e}`);
    }

    try {
      const ambeo = await api.getAmbeoStatus();
      const enabled = ambeo?.value?.bool_ ? "ON" : "OFF";
      console.log(`Ambeo 3D:           ${enabled}`);
    } catch (e) {
      console.log(`Ambeo 3D:           Error - ${e}`);
    }

    try {
      const nightMode = await api.getNightModeStatus();
      const enabled = nightMode?.value?.bool_ ? "ON" : "OFF";
      console.log(`Night Mode:         ${enabled}`);
    } catch (e) {
      console.log(`Night Mode:         Error - ${e}`);
    }

    try {
      const voice = await api.getVoiceEnhancementStatus();
      const enabled = voice?.value?.bool_ ? "ON" : "OFF";
      console.log(`Voice Enhancement:  ${enabled}`);
    } catch (e) {
      console.log(`Voice Enhancement:  Error - ${e}`);
    }

    console.log();
  });

// Mode command
program
  .command("mode <preset>")
  .description("Set audio mode/preset (movie, music, etc.)")
  .action(async (preset: string) => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);

    try {
      const result = await api.setAudioPreset(preset.toLowerCase());
      console.log(`Audio mode set to: ${preset}`);
      console.log(`Response: ${JSON.stringify(result)}`);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  });

// Ambeo command
program
  .command("ambeo <state>")
  .description("Toggle Ambeo 3D mode (on/off)")
  .action(async (state: string) => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);

    const enabled = state.toLowerCase() === "on";
    try {
      const result = await api.setAmbeo(enabled);
      console.log(`Ambeo 3D ${enabled ? "enabled" : "disabled"}`);
      console.log(`Response: ${JSON.stringify(result)}`);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  });

// Night mode command
program
  .command("night <state>")
  .description("Toggle night mode (on/off)")
  .action(async (state: string) => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);

    const enabled = state.toLowerCase() === "on";
    try {
      const result = await api.setNightMode(enabled);
      console.log(`Night mode ${enabled ? "enabled" : "disabled"}`);
      console.log(`Response: ${JSON.stringify(result)}`);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  });

// Voice enhancement command
program
  .command("voice <state>")
  .description("Toggle voice enhancement (on/off)")
  .action(async (state: string) => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);

    const enabled = state.toLowerCase() === "on";
    try {
      const result = await api.setVoiceEnhancement(enabled);
      console.log(`Voice enhancement ${enabled ? "enabled" : "disabled"}`);
      console.log(`Response: ${JSON.stringify(result)}`);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  });

function getInputInfo(input: any): { name: string; serviceId: string } {
  return {
    name: input?.[0]?.playLogicData?.mediaRoles?.title || "unknown",
    serviceId: input?.[0]?.playLogicData?.mediaRoles?.mediaData?.metaData?.serviceID || "unknown",
  };
}

async function applySettings(api: SoundbarAPI, serviceId: string): Promise<void> {
  const isTV = serviceId.toUpperCase() === "HDMI";
  const isMusicSource = ["AIRPLAY", "SPOTIFY", "BLUETOOTH"].includes(serviceId.toUpperCase());

  if (isTV) {
    console.log("Detected TV input - applying Movie mode settings...");
    await api.setAudioPreset("movie");
    await api.setAmbeo(true);
    await api.setVoiceEnhancement(true);
  } else if (isMusicSource) {
    console.log("Detected music input - applying Music mode settings...");
    await api.setAudioPreset("music");
    await api.setAmbeo(false);
    await api.setVoiceEnhancement(false);
  } else {
    console.log(`Unknown input type: ${serviceId} - no changes made.`);
  }
}

async function runAuto(api: SoundbarAPI): Promise<void> {
  const input = await api.getCurrentInput();
  const { name: inputName, serviceId } = getInputInfo(input);
  console.log(`Current Input: ${inputName} (${serviceId})`);
  await applySettings(api, serviceId);
}

// Auto command - automatically configure based on input
program
  .command("auto")
  .description("Automatically configure soundbar based on current input")
  .action(async () => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);
    try {
      await runAuto(api);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  });

// Daemon command - run auto in a loop
program
  .command("daemon")
  .description("Run auto-configuration in a loop")
  .option("--interval <seconds>", "Seconds between checks", "15")
  .action(async (opts) => {
    const host = program.opts().host;
    const api = new SoundbarAPI(host);
    const interval = parseInt(opts.interval, 10) * 1000;

    console.log(`Starting soundbar daemon (interval: ${opts.interval}s, host: ${host})`);

    let lastServiceId: string | null = null;

    const run = async () => {
      try {
        const input = await api.getCurrentInput();
        const { name: inputName, serviceId } = getInputInfo(input);

        if (serviceId !== lastServiceId) {
          console.log(`Input changed: ${inputName} (${serviceId})`);
          await applySettings(api, serviceId);
          lastServiceId = serviceId;
        }
      } catch (e) {
        console.error(`Error: ${e}`);
      }
    };

    await run();
    setInterval(run, interval);
  });

program.parse();
