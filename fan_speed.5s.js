#!/usr/bin/env /usr/local/bin/node
const bitbar = require('bitbar')
const execSync = require('child_process').execSync

let speeds= ''

for (var fanCount = 0; fanCount < 2; fanCount++) {
    let str = execSync(`/usr/local/bin/smc -k F${fanCount}Ac -r`).toString()
    let result = str.match(/\(bytes (.+)\)/)
    
    let array = result[1].split(' ')
    
    let buffer = new ArrayBuffer(4)
    let bytes = new Uint8Array(buffer)
    
    array.forEach((element, index) => {
        bytes[index] = parseInt(element, 16)
    })
    
    let view = new DataView(buffer)
    
    speeds += Math.floor(view.getFloat32(0, true)).toString()
    speeds += ' rpm '
}

bitbar([
    {
        text: speeds,
        color: bitbar.darkMode ? 'white' : 'black',
        dropdown: false,
        size: 12
    }
])
