// Story CRUDL API
import { dataUtilsService } from '../../services/dataUtils.service.js';
import { storyService } from './story.service.js';

export const storyController = {
    getStories,
    getStory,
    removeStory,
    addStory,
    updateStory
}

// List
export async function getStories(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            byUsername: req.query.byUsername || '',
            pageIdx: req.query.pageIdx || undefined,
        }
        const sortObj = {
            sortBy: req.query.sortBy || '',
            isAscending: req.query.isAscending || "true"
        }
        const stories = await storyService.query(filterBy, sortObj)
        res.send(stories)
    } 
    catch (err) {
        res.status(400).send(`Couldn't get stories` + err)
        console.log(err)
    }
}

// Read
export async function getStory(req, res) {
    try {
        const { storyId } = req.params
        // In the future we may want to know stories user visited e.g. in the past hour / or past day etc...
        const visitedStories = JSON.parse(req.cookies.visitedStories || JSON.stringify([]))
        const story = await storyService.getById(storyId)
        visitedStories.push(story._id)
        res.cookie('visitedStories', JSON.stringify(visitedStories), { maxAge: 60 * 60 * 1000 }) // past hour
        res.send(story)
    } 
    catch (err) {
        res.status(400).send(`Couldn't get story` + err)
        console.log(err)
    }
}


// Delete
export async function removeStory(req, res) {
    try {
        const { storyId } = req.params
        await storyService.remove(storyId, req.loggedinUser)
        res.send('Deleted OK')
    } 
    catch (err) {
        res.status(403).send(`Couldn't remove story : ` + err)
        console.log(err)
    }
}


// Create
export async function addStory(req, res) {
    try {
        const storyToAdd = dataUtilsService.storyFields(req) 
        //console.log("story.controller.addStory: ", storyToAdd)
        const addedStory = await storyService.save(storyToAdd, req.loggedinUser)
        res.send(addedStory)
    } 
    catch (err) {
        res.status(403).send(`Couldn't add story : ` + err)
        console.log(err)
    }
}

// Update
export async function updateStory(req, res) {
    try {
        const storyToUpdate = dataUtilsService.storyFields(req) 
        //console.log("story.controller.updateStory: ", storyToUpdate)
        const updatedStory = await storyService.save(storyToUpdate, req.loggedinUser)
        res.send(updatedStory)
    } 
    catch (err) {
        res.status(403).send(`Couldn't update story : ` + err)
        console.log(err)
    }
}


// Story utilities for EXPLICITLY destructuring only the relevant fields:

/*const _miniUser = ({ _id, username, imgUrl }) => ({ _id, username, imgUrl })
const _likedByArray = ({ likedBy }) => [...likedBy.map(obj => (_miniUser(obj)))]
const _commentFields = (comment) => {
    const { _id, createdAt, txt } = comment
    const by =  _miniUser(comment.by)
    const likedBy = _likedByArray(comment)
    return { _id, createdAt, txt, by, likedBy }
}
const _commentsArray = ({ comments }) => [...comments.map(obj => (_commentFields(obj)))]
const _storyFields = ({ body }) => {
    const { _id = null, txt, imgUrl } = body
    const by = body.by ? _miniUser(body.by) : null
    const likedBy = _likedByArray(body)
    const comments = _commentsArray(body)
    let fields = { txt, imgUrl, likedBy, comments } 
    fields = by ? {...fields, by} : fields      // When adding - server takes 'by' from 'loggedInUser', as opposed to update
    fields = _id ? {...fields, _id} : fields    // When adding - server generates ID, as opposed to update
    return fields
}*/

