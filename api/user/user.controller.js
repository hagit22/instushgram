// User CRUDL API
import { dataUtilsService } from '../../services/dataUtils.service.js';
import { userService } from './user.service.js';

export const userController = {
    getUsers,
    getUserById,
    getUserByName,
    removeUser,
    addUser,
    updateUser
}

// List
export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.send(users)
    } 
    catch (err) {
        res.status(400).send(`Couldn't get users : ` + err)
        console.log(err.message)
    }
}

// Read
export async function getUserById(req, res) {
    try {
        const { userId } = req.params
        const user = await userService.getById(userId)
        res.send(user)
    } 
    catch (err) {
        res.status(400).send(`Couldn't get user : ` + err)
        console.log(err.message)
    }
}


export async function getUserByName(req, res) {
    try {
        const { userName } = req.params
        const user = await userService.getByUsername(userName)
        res.send(user)
    } 
    catch (err) {
        res.status(400).send(`Couldn't get user : ` + err)
        console.log(err.message)
    }
}


// Delete
export async function removeUser(req, res) {
    try {
        const { userId } = req.params
        await userService.remove(userId)
        res.send('Deleted OK')
    } 
    catch (err) {
        res.status(400).send(`Couldn't remove user : ` + err)
        console.log(err.message)
    }
}


// Create
export async function addUser(req, res) {
    try {
        const userToAdd = dataUtilsService.userFields(req) 
        //console.log("user.controller.addUser: ", userToAdd)
        const savedUser = await userService.save(userToAdd)
        res.send(savedUser)
    } 
    catch (err) {
        res.status(400).send(`Couldn't add user : ` + err)
        console.log(err.message)
    }
}

// Update
export async function updateUser(req, res) {
    try {
        const userToUpdate = dataUtilsService.userFields(req) 
        //console.log("user.controller.updateUser: ", userToUpdate)
        const savedUser = await userService.save(userToUpdate)
        res.send(savedUser)
    } 
    catch (err) {
        res.status(400).send(`Couldn't update user : ` + err)
        console.log(err.message)
    }
}




/*
const _miniUser = ({ _id, username, imgUrl }) => ({ _id, username, imgUrl })
const _miniStory = ({ _id, imgUrl }) => ({ _id, imgUrl })
const _followingArray = ({ following }) => [...following.map(obj => (_miniUser(obj)))]
const _followersArray = ({ followers }) => [...followers.map(obj => (_miniUser(obj)))]
const _bookmarksArray = ({ bookmarkedStories }) => [...bookmarkedStories.map(obj => (_miniUser(obj)))]
const _userFields = ({ body }) => {
    const { _id = null, username, password, fullname, imgUrl } = body
    const following = _followingArray(body)
    const followers = _followersArray(body)
    const bookmarkedStories = _bookmarksArray(body)
    let fields = { username, password, fullname, imgUrl, following, followers, bookmarkedStories } 
    fields = _id ? {...fields, _id} : fields    // When adding - server generates ID, as opposed to update
    return fields
}
*/

