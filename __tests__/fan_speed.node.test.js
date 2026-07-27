const test = require('node:test');
const assert = require('node:assert/strict');
const { extractBytesPayload, parseFanData } = require('../fan_speed.5s');

test('extractBytesPayload returns the hex bytes from a bytes payload', () => {
  assert.equal(extractBytesPayload('(bytes 4c 3e 0a 00)'), '4c 3e 0a 00');
});

test('extractBytesPayload handles JSON-like output', () => {
  const payload = '{"Fans":{"Fan 1 Current Speed":{"quantity":"(bytes 4c 3e 0a 00)"}}}';
  assert.equal(extractBytesPayload(payload), '4c 3e 0a 00');
});

test('parseFanData reads the current speed from ismc JSON output', () => {
  const payload = JSON.stringify({
    'Fan 1 Current Speed': { quantity: 1705 },
    'Fan Count': { quantity: 1 },
  });

  assert.deepEqual(parseFanData(payload), { fanCount: 1, speeds: [1705] });
});
