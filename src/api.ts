/**
 * API client for Sennheiser Ambeo soundbar
 */

export class SoundbarAPI {
  private baseUrl: string;

  constructor(host: string = "192.168.1.119") {
    this.baseUrl = `http://${host}/api`;
  }

  private getTimestamp(): number {
    return Date.now();
  }

  private async getData(path: string, roles: string = "@all"): Promise<any> {
    const url = new URL(`${this.baseUrl}/getData`);
    url.searchParams.set("path", path);
    url.searchParams.set("roles", roles);
    url.searchParams.set("_nocache", this.getTimestamp().toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private async setData(path: string, value: any): Promise<any> {
    const url = new URL(`${this.baseUrl}/setData`);
    url.searchParams.set("path", path);
    url.searchParams.set("role", "value");
    url.searchParams.set("value", JSON.stringify(value));
    url.searchParams.set("_nocache", this.getTimestamp().toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Getters
  async getAudioPreset(): Promise<any> {
    return this.getData("settings:/popcorn/audio/audioPresets/audioPreset");
  }

  async getCurrentInput(): Promise<any> {
    return this.getData("player:player/data/value", "value");
  }

  async getAmbeoStatus(): Promise<any> {
    return this.getData("settings:/popcorn/audio/ambeoModeStatus");
  }

  async getNightModeStatus(): Promise<any> {
    return this.getData("settings:/popcorn/audio/nightModeStatus");
  }

  async getVoiceEnhancementStatus(): Promise<any> {
    return this.getData("settings:/popcorn/audio/voiceEnhancement");
  }

  // Setters
  async setAmbeo(enabled: boolean): Promise<any> {
    const value = { type: "bool_", bool_: enabled };
    return this.setData("settings:/popcorn/audio/ambeoModeStatus", value);
  }

  async setNightMode(enabled: boolean): Promise<any> {
    const value = { type: "bool_", bool_: enabled };
    return this.setData("settings:/popcorn/audio/nightModeStatus", value);
  }

  async setVoiceEnhancement(enabled: boolean): Promise<any> {
    const value = { type: "bool_", bool_: enabled };
    return this.setData("settings:/popcorn/audio/voiceEnhancement", value);
  }

  async setAudioPreset(mode: string): Promise<any> {
    const value = { popcornAudioPreset: mode, type: "popcornAudioPreset" };
    return this.setData("settings:/popcorn/audio/audioPresets/audioPreset", value);
  }
}
