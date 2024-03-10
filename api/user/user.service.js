import { ObjectId } from 'mongodb';
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js';

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    save,
    doesUserExist
}

const COLLECTION = 'user'

async function query() {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const users = await collection.find().toArray()
        users.forEach(user => delete user.password)
        return users
    } 
    catch(err) {
        loggerService.error(`Had problems getting users...`)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const user = await collection.findOne({ _id: new ObjectId(userId) })
        delete user.password
        return user
    } 
    catch (err) {
        loggerService.error(`Had problems getting user by id ${userId}...`)
        throw err
    }
}

async function getByUsername(username, withPassword=false) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        var regex = new RegExp(["^", username, "$"].join(""), "i");
        const user = await collection.findOne({ username: regex })
        if (!withPassword)
            delete user.password
        return user
    } 
    catch (err) {
        loggerService.error(`Had problems getting user by username ${username}...`)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        const { acknowledged } = await collection.deleteOne({ _id: new ObjectId(userId) })
        return acknowledged ? `User ${userId} removed` : `Did not remove user ${userId}`
    } 
    catch (err) {
        loggerService.error(`Had problems removing user ${userId}...`)
        throw err
    }
}

async function save(userToSave) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        if(userToSave._id && userToSave._id.length > 0) {
            const userUpdate = {
                fullname: userToSave.fullname,
                imgUrl: userToSave.imgUrl,
                following: JSON.parse(JSON.stringify(userToSave.following)),
                followers: JSON.parse(JSON.stringify(userToSave.followers)),
                bookmarkedStories: JSON.parse(JSON.stringify(userToSave.bookmarkedStories))
            }
            const { acknowledged } = await collection.updateOne({ _id: new ObjectId(userToSave._id) }, { $set: userUpdate })
            return acknowledged ? userToSave : `Did not update user` // returning userToSave because it includes the id
         } 
        else {
            // Adding default initialization to brand new user that just signed up
            userToSave = {...userToSave, following: [], followers: [], bookmarkedStories: []}
            const { acknowledged } = await collection.insertOne(userToSave)
            return acknowledged ? userToSave : `Did not add user`
        }
    } catch (err) {
        loggerService.error(`Had problems saving user ${userToSave._id}...`)
        throw err
    }
}

async function doesUserExist(username) {
    try {
        const collection = await dbService.getCollection(COLLECTION)
        var regex = new RegExp(["^", username, "$"].join(""), "i");
        const user = await collection.findOne({ username: regex })
        if (!user)
            return false
        return true
    } 
    catch (err) {
        loggerService.error(`User already exists ${username}`)
            return false
    }
}



