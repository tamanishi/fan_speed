#!/usr/bin/env node
// <bitbar.title>fan_speed</bitbar.title>
// <bitbar.version>v1.0</bitbar.version>
// <bitbar.author>Masayuki Sunahara</bitbar.author>
// <bitbar.author.github>tamanishi</bitbar.author.github>
// <bitbar.desc>Shows fan speed. Strongly inpired by Eric Ripa's "Fan Speed" plugin.</bitbar.desc>
// <bitbar.image>https://github.com/tamanishi/fan_speed/blob/master/image.png?raw=true</bitbar.image>
// <bitbar.dependencies>node</bitbar.dependencies>
// <bitbar.abouturl>https://github.com/tamanishi/fan_speed</bitbar.abouturl> 

const execSync = require('child_process').execSync

let speeds = ''

let str = execSync(`/usr/local/bin/smc -k FNum -r`).toString()
let result = str.match(/\(bytes (.+)\)/)
let fanNumber = parseInt(result[1])

for (var fanCount = 0; fanCount < fanNumber; fanCount++) {
    // smc command responds like "  F0Ac  [flt ]  (bytes d0 f4 9c 44)".
    let str = execSync(`/usr/local/bin/smc -k F${fanCount}Ac -r`).toString()
    // extract inside parrens.
    let result = str.match(/\(bytes (.+)\)/)
    
    let array = result[1].split(' ')
    
    let buffer = new ArrayBuffer(4)
    let bytes = new Uint8Array(buffer)
    
    array.forEach((element, index) => {
        bytes[index] = parseInt(element, 16)
    })
    
    let view = new DataView(buffer)
    
    // "true" means "treat as Little-endian".
    speeds += Math.floor(view.getFloat32(0, true)).toString()
    speeds += ' rpm '
}

if (process.env.SWIFTBAR === '1') {
    console.log(':wind.snow: ' + speeds + '| size=12, symbolize=true')
} else {
    console.log(':cyclone: ' + speeds + '| size=12')
}

