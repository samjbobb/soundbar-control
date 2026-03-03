// Node-RED Function Node - Soundbar Auto Mode
// Copy this entire code into a Node-RED function node
// Triggers every 30 seconds to automatically adjust soundbar settings based on input

const SOUNDBAR_HOST = "192.168.1.119";
const BASE_URL = `http://${SOUNDBAR_HOST}/api`;

// Helper to make API calls
async function getData(path, roles = "@all") {
    const url = `${BASE_URL}/getData?path=${encodeURIComponent(path)}&roles=${encodeURIComponent(roles)}&_nocache=${Date.now()}`;
    const response = await fetch(url);
    return await response.json();
}

async function setData(path, value) {
    const url = `${BASE_URL}/setData?path=${encodeURIComponent(path)}&role=value&value=${encodeURIComponent(JSON.stringify(value))}&_nocache=${Date.now()}`;
    const response = await fetch(url);
    return await response.json();
}

// Main logic
try {
    // Get current input
    const input = await getData("player:player/data/value", "value");
    const serviceId = input?.[0]?.playLogicData?.mediaRoles?.mediaData?.metaData?.serviceID || "unknown";
    const inputName = input?.[0]?.playLogicData?.mediaRoles?.title || "unknown";

    // Determine input type
    const isTV = serviceId.toUpperCase() === "HDMI";
    const isMusicSource = ["AIRPLAY", "SPOTIFY", "BLUETOOTH"].includes(serviceId.toUpperCase());

    let changes = [];

    if (isTV) {
        // TV/HDMI: Movie mode, Ambeo ON, Voice Enhancement ON
        await setData("settings:/popcorn/audio/audioPresets/audioPreset", {
            popcornAudioPreset: "movie",
            type: "popcornAudioPreset"
        });
        changes.push("mode → movie");

        await setData("settings:/popcorn/audio/ambeoModeStatus", {
            type: "bool_",
            bool_: true
        });
        changes.push("ambeo → on");

        await setData("settings:/popcorn/audio/voiceEnhancement", {
            type: "bool_",
            bool_: true
        });
        changes.push("voice → on");

        msg.payload = {
            input: inputName,
            serviceId: serviceId,
            profile: "TV",
            changes: changes
        };

    } else if (isMusicSource) {
        // Music sources: Music mode, Ambeo OFF, Voice Enhancement OFF
        await setData("settings:/popcorn/audio/audioPresets/audioPreset", {
            popcornAudioPreset: "music",
            type: "popcornAudioPreset"
        });
        changes.push("mode → music");

        await setData("settings:/popcorn/audio/ambeoModeStatus", {
            type: "bool_",
            bool_: false
        });
        changes.push("ambeo → off");

        await setData("settings:/popcorn/audio/voiceEnhancement", {
            type: "bool_",
            bool_: false
        });
        changes.push("voice → off");

        msg.payload = {
            input: inputName,
            serviceId: serviceId,
            profile: "Music",
            changes: changes
        };

    } else {
        // Unknown input - no changes
        msg.payload = {
            input: inputName,
            serviceId: serviceId,
            profile: "Unknown",
            changes: []
        };
    }

    return msg;

} catch (error) {
    msg.payload = {
        error: error.message
    };
    return msg;
}
