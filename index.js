// @ts-check

/*
    Commands:
    node index.js json=testFiles/de.json
    node index.js csv=testFiles/de.csv
*/


/**
 * separates cells
 * @type {string}
 * */
const separator = ','
/** 
 * qualifies a cell or textfield
 * @type {string}
 * */
const textQualifier = '"'
/**
 * makes a new line
 * @type {string}
 * */
const newLine = '\n'
/**
 * namespace for key cell representing object properties
 * @type {string}
 * */
const nameSpaceSeparator = '_'

/**
 * makes a CSV string from an object
 * @param {object} obj
 * @param {string[]} buffer
 * @param {string} [namespace='']
 * @param {boolean} [returnStr=true]
 * @returns {string|string[]}
 */
const jsonToCsv = (obj, buffer = [], namespace = '', returnStr = true) => {
    for (const key in obj) {
        // @ts-ignore
        if(typeof obj[key] === 'object') buffer = buffer.concat(jsonToCsv(obj[key], [], `${namespace}${key}${nameSpaceSeparator}`, false))
        if(typeof obj[key] === 'string') buffer.push(`${namespace}${key}${separator}${textQualifier}${obj[key]}${textQualifier}${newLine}`)
    }
    return returnStr ? buffer.join('') : buffer
}
//fetch('de.json').then(resp => resp.json().then(json => console.log(jsonToCsv(json))))

/**
 * make an object from a csv string
 * @param {string} str
 * @param {{}} buffer
 * @returns {{}}
 */
const csvToJson = (str, buffer = {}) => {
    /** @type {string[]} */
    const lines = str.split(newLine)
    lines.forEach(line => {
        if(line){
            let [all, key, value] = line.match(/(.*?),(.*)/)
            if(key && value){
                value = value.replace(new RegExp(`^${textQualifier}(.+(?=${textQualifier}$))${textQualifier}$`), '$1')
                key.split(nameSpaceSeparator).reduce((obj, key, i, keys) => (keys.length -1 === i ? obj[key] = value : obj[key] ? obj[key] : (obj[key] = {})), buffer)
            }else{console.warn('csvToJson was not able to reliably read: ', all)}
        }
    })
    return buffer
}
//fetch('de.csv').then(resp => resp.text().then(csv => console.log(csvToJson(csv))))

// nodejs
const fs = require('fs')
// @ts-ignore
const commands = new Map(process.argv.filter(arg => arg.includes('=')).map(str => str.split('=')))
let path
// jsonToCsv
if((path = commands.get('json')) && path.includes('.json')){
    fs.readFile(path, 'utf-8', (err, json) => {
        if (err) return console.error(err)
        try{
            let newPath
            fs.writeFile((newPath = path.replace('.json', '.csv')), jsonToCsv(JSON.parse(json)), (err) => {
                if (err) return console.error(err)
                console.log(`Successfully Written to File: ${newPath}`)
            })
        }catch(err){
            console.error('could not JSON.parse:', json, err)
        }
    })
// csvToJson
}else if((path = commands.get('csv')) && path.includes('.csv')){
    fs.readFile(path, 'utf-8', (err, csv) => {
        if (err) return console.error(err)
        try{
            let newPath
            fs.writeFile((newPath = path.replace('.csv', '.json')), JSON.stringify(csvToJson(csv), null, 2), (err) => {
                if (err) return console.error(err)
                console.log(`Successfully Written to File: ${newPath}`)
            })
        }catch(err){
            console.error('could not JSON.stringify:', csvToJson(csv), err)
        }
    })
}