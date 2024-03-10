import fs from 'fs'

export const utilService = {
    makeId,
    readJsonFile,
    saveEntitiesToFile,
    toLowerCaseAllowEmpty
}

function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function readJsonFile(path) {
    const str = fs.readFileSync(path, 'utf8')
    const json = JSON.parse(str)
    return json
}

function saveEntitiesToFile(entities, path) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(entities, null, 2)
        fs.writeFile(path, jsonData, (err) => {
            if (err) 
                return reject(err)
            resolve()
        })
    })
}

function toLowerCaseAllowEmpty(obj) {
    try {
        return String(obj).toLowerCase()
    }
    catch(error) { // for example, a blank string
        return obj
    }
}

