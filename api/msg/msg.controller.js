// Msg CRUDL API
//import { authService } from '../auth/auth.service.js';
import { msgService } from './msg.service.js';

export const msgController = {
    getMsgs,
    getMsg,
    removeMsg,
    addMsg,
    updateMsg
}

// List
export async function getMsgs(req, res) {
    try {
        const msgs = await msgService.query()
        res.send(msgs)
    } 
    catch (err) {
        console.log(err)
        res.status(400).send(`Couldn't get msgs -->  ` + err)
    }
}

// Read
export async function getMsg(req, res) {
    try {
        const { msgId } = req.params
        const msg = await msgService.getById(msgId)
        res.send(msg)
    } 
    catch (err) {
        res.status(400).send(`Couldn't get msg -->  ` + err)
        console.log(err)
    }
}


// Delete
export async function removeMsg(req, res) {
    try {
        const { msgId } = req.params
        await msgService.remove(msgId, req.loggedinUser)
        res.send('Deleted OK')
    } 
    catch (err) {
        res.status(403).send(`Couldn't remove msg -->  ` + err)
        console.log(err)
    }
}


// Create
export async function addMsg(req, res) {
    try {
        const { txt, aboutStoryId } = req.body
        const msgToSave = { txt, aboutStoryId }  
        const savedMsg = await msgService.save(msgToSave, req.loggedinUser)
        res.send(savedMsg)
    } 
    catch (err) {
        res.status(403).send(`Couldn't add msg -->  ` + err)
        console.log(err)
    }
}

// Update
export async function updateMsg(req, res) {
    try {
        const { _id, txt } = req.body  
        const msgToSave = { _id, txt }
        const savedMsg = await msgService.save(msgToSave, req.loggedinUser)
        res.send(savedMsg)
    } 
    catch (err) {
        res.status(403).send(`Couldn't update msg -->  ` + err)
        console.log(err)
    }
}
