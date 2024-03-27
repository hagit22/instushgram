import { ObjectId } from 'mongodb';
import { socketService, notificationTypes } from '../../services/socket.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js';
import { userService } from '../user/user.service.js';


export const storyService = {
    query,
    getById,
    remove,
    save,
}

const COLLECTION = 'story'
const PAGE_SIZE = 5

async function query(filterBy = {}, sortObj = {}) {
    try {
        const collection = await dbService.getCollection(COLLECTION)

        const criteria = _buildCriteria(filterBy)
        const storyCursor = await collection.find(criteria)

        if (filterBy.pageIdx !== undefined) {
            let pageIdx = filterBy.pageIdx < 0 ? 0 : filterBy.pageIdx
            const lastDoc = collection.countDocuments - 1
            pageIdx = pageIdx > lastDoc ? lastDoc : pageIdx

            const startIdx = pageIdx * PAGE_SIZE
            storyCursor.skip(startIdx).limit(PAGE_SIZE)
        }
        if (sortObj.sortBy !== '') {
            const sortKey = sortObj.sortBy != 'createdAt' ? sortObj.sortBy : '_id' // use Mongo's ObjectId-timestamp to sort by 'CreatedAt'
            const sortDir = sortObj.isAscending == "true" ? 1 : -1
            storyCursor.collation({locale: "en" }).sort({[sortKey]: sortDir}) // the 'local' is for not being case sensitive
        }
    
        const stories = storyCursor.toArray()
        return stories
    } 
    catch(err) {
        loggerService.error(`Had problems getting stories...`)
        throw err
    }
}

async function getById(storyId) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const story = await collection.findOne({ _id: new ObjectId(storyId) })
        return story
    } 
    catch (err) {
        loggerService.error(`Had problems getting story ${storyId}...`)
        throw err
    }
}

async function remove(storyId, loggedinUser) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const story = await collection.findOne({ _id: new ObjectId(storyId) })

        if (!loggedinUser.isAdmin && story.by._id !== loggedinUser._id) 
            throw ( 'You are not story owner' )

        const { acknowledged } = await collection.deleteOne({ _id: new ObjectId(storyId) })
        return acknowledged ? `Story ${storyId} removed` : `Did not remove story ${storyId}`
    } 
    catch (err) {
        loggerService.error(`Had problems removing story ${storyId}...`)
        throw err
    }
}

async function save(storyToSave, loggedinUser) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        if(storyToSave._id && storyToSave._id.length > 0) {
            //if (!loggedinUser.isAdmin && storyToSave.by._id !== loggedinUser?._id) 
                //throw ('You are not story owner')
            const storyUpdate = {
                txt: storyToSave.txt,
                imgUrl: storyToSave.imgUrl,
                by: {...storyToSave.by},
                createdAt: storyToSave.createdAt,
                likedBy: JSON.parse(JSON.stringify(storyToSave.likedBy)),
                comments: JSON.parse(JSON.stringify(storyToSave.comments))
            }
            const { acknowledged } = await collection.updateOne({ _id: new ObjectId(storyToSave._id) }, { $set: storyUpdate })
            return acknowledged ? storyToSave : `Did not update story` // returning storyToSave because it includes the id
         } 
        else {
            storyToSave.createdAt = new Date(Date.now()).toISOString()
            storyToSave.by = {
                _id: loggedinUser._id, 
                username: loggedinUser.username, 
                imgUrl:  loggedinUser.imgUrl
            }
            const { acknowledged, insertedId: newStoryId } = await collection.insertOne(storyToSave)
            if (acknowledged) {
                socketService.broadcast(loggedinUser._id, notificationTypes.newStory, {newStoryId})
                socketService.broadcast(loggedinUser._id, notificationTypes.storyByFollowing, 
                            {followingUserId: loggedinUser._id, storyImgUrl: storyToSave.imgUrl})
            }
            return acknowledged ? storyToSave : `Did not add story`
        }
    } catch (err) {
        loggerService.error(`Had problems saving story ${storyToSave._id}...`)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        criteria.txt = { $regex: filterBy.txt, $options: 'i' }
    }
    if (filterBy.byUsername) {
        //criteria.by.username = { $eq: filterBy.byUsername }
        criteria.by.username = { $regex: filterBy.byUsername, $options: 'i' }
    }
    return criteria
}

