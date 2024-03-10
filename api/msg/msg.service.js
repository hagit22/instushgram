import { ObjectId } from 'mongodb';
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js';
import { userService } from '../user/user.service.js';
import { storyService } from '../story/story.service.js';


export const msgService = {
    query,
    getById,
    remove,
    save,
}

const COLLECTION = 'msg'

async function query() {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        //const msgs = await collection.find().toArray()

        var msgs = await collection.aggregate([  
            { $lookup: { localField: 'aboutStoryId', from: 'story', foreignField: '_id', as: 'aboutStory' }},
            { $unwind: '$aboutStory' }, // without the 'unwind', the referenced document would be returned in an array
            { $lookup: { localField: 'byUserId', from: 'user', foreignField: '_id', as: 'byUser' }},
            { $unwind: '$byUser' }, // without the 'unwind', the referenced document would be returned in an array
            { $project: { _id: true, txt: true, // (without 'project', we get all fields of referenced documents (and the reference id's))
                        "aboutStory._id": true, "aboutStory.title": true, "aboutStory.severity": true,
                        "byUser._id": true, "byUser.fullname": true }}
        ]).toArray()

        // Alternative to '$project': (using map and delete)
        // --------------------------

        // msgs = msgs.map(msg => {
        //     msg.aboutStory = { _id: msg.aboutStory._id, title: msg.aboutStory.title, severity: msg.aboutStory.severity }
        //     msg.byUser = { _id: msg.byUser._id, fullname: msg.byUser.fullname }
        //     delete msg.aboutStoryId
        //     delete msg.byUserId
        //     return msg
        // })

        return msgs
    } 
    catch(err) {
        loggerService.error(`Had problems getting msgs...`)
        throw err
    }
}

async function getById(msgId) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const msg = await collection.findOne({ _id: new ObjectId(msgId) })
        return msg
    } 
    catch (err) {
        loggerService.error(`Had problems getting msg ${msgId}...`)
        throw err
    }
}

async function remove(msgId, loggedinUser) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        if (!loggedinUser.isAdmin) 
            throw ( 'You are not Admin' )

        const { acknowledged } = await collection.deleteOne({ _id: new ObjectId(msgId) })
        return acknowledged ? `Msg ${msgId} removed` : `Could not remove msg ${msgId}`
    } 
    catch (err) {
        loggerService.error(`Had problems removing msg ${msgId}...`)
        throw err
    }
}

async function save(msgToSave, loggedinUser) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        if (msgToSave._id && msgToSave._id.length > 0) {
            if (msgToSave.creator._id !== loggedinUser?._id) 
                throw ('You are not msg creator')
            const msgUpdate = { txt: msgToSave.txt }
            const { acknowledged } = await collection.updateOne({ _id: new ObjectId(msgToSave._id) }, { $set: msgUpdate })
            return acknowledged ? msgToSave : `Could not update msg`
        } 
        else {
            if (!msgToSave.aboutStoryId || msgToSave.aboutStoryId.length <= 0) 
                throw ('Msg not associated with any story')
            const msgToInsert = { txt: msgToSave.txt }
            msgToInsert.aboutStoryId = new ObjectId(msgToSave.aboutStoryId)
            msgToInsert.byUserId = new ObjectId(loggedinUser._id)
            const { acknowledged } = await collection.insertOne(msgToInsert)
            if (!acknowledged)
                return `Could not add msg`
                
            // let's return the referenced documents' fields instead of the reference id's
            const { fullname } = await userService.getById(loggedinUser._id)
            msgToSave.byUser = { id: loggedinUser._id, fullname }
            const { title, severity } = await storyService.getById(msgToSave.aboutStoryId)
            msgToSave.aboutStory = { _id: msgToSave.aboutStoryId, title, severity}
            return msgToSave
        }
    }
    catch (err) {
        loggerService.error(`Had problems saving msg ${msgToSave._id}...`)
        throw err
    }
}





