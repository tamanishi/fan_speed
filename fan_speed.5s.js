#!/usr/bin/env node
// <bitbar.title>fan_speed</bitbar.title>
// <bitbar.version>v2.0</bitbar.version>
// <bitbar.author>Masayuki Sunahara</bitbar.author>
// <bitbar.author.github>tamanishi</bitbar.author.github>
// <bitbar.desc>Shows fan speed.</bitbar.desc>
// <bitbar.image>https://github.com/tamanishi/fan_speed/blob/master/image.png?raw=true</bitbar.image>
// <bitbar.dependencies>node</bitbar.dependencies>
// <bitbar.abouturl>https://github.com/tamanishi/fan_speed</bitbar.abouturl>

const execSync = require('child_process').execSync;

function extractBytesPayload(input) {
    if (typeof input !== 'string') {
        return null;
    }

    const match = input.match(/\(bytes\s+([0-9a-fA-F\s]+)\)/i);
    return match ? match[1].trim() : null;
}

function parseFanData(input) {
    if (typeof input !== 'string') {
        return null;
    }

    let data;
    try {
        data = JSON.parse(input);
    } catch (error) {
        return null;
    }

    if (!data || typeof data !== 'object') {
        return null;
    }

    const fanSection = data.Fans && typeof data.Fans === 'object' ? data.Fans : data;
    const fanCountEntry = fanSection['Fan Count'] || Object.values(fanSection).find((entry) => entry && entry.key === 'FNum');
    const fanCount = fanCountEntry && Number.isFinite(Number(fanCountEntry.quantity))
        ? Number(fanCountEntry.quantity)
        : 0;

    const speeds = Object.entries(fanSection)
        .filter(([name, entry]) => name.includes('Current Speed') && entry && Number.isFinite(Number(entry.quantity)))
        .map(([, entry]) => Number(entry.quantity));

    return {
        fanCount,
        speeds,
    };
}

function run() {
    let speeds = '';

    try {
        const str = execSync(`/opt/homebrew/bin/ismc -o json | jq '."Fans"'`).toString();
        const fanData = parseFanData(str);

        if (fanData && fanData.speeds.length > 0) {
            speeds = fanData.speeds.map((value) => `${value} rpm`).join(' ');
        } else {
            speeds = 'N/A';
            console.warn('Warning: Could not determine the number of fans or read fan data.');
        }
    } catch (e) {
        speeds = 'N/A';
        console.error('Critical Error: Failed to execute `ismc` or process fan speed.', e);
    }

    if (process.env.SWIFTBAR === '1') {
        console.log(':wind.snow: ' + speeds + '| size=12, symbolize=true');
    } else {
        console.log(':cyclone: ' + speeds + '| size=12');
    }
}

if (require.main === module) {
    run();
}

module.exports = {
    extractBytesPayload,
    parseFanData,
    run,
};
