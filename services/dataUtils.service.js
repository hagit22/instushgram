// Utilities for EXPLICITLY destructuring only the relevant data fields:


const _miniUser = ({ _id, username, imgUrl }) => ({ _id, username, imgUrl })
const _miniUsersArray = ( miniUsers ) => !miniUsers || miniUsers.length == 0 ? [] : [...miniUsers.map(obj => (_miniUser(obj)))]

const _miniStory = ({ _id, imgUrl }) => ({ _id, imgUrl })
const _miniStoriesArray = ( miniStories ) => !miniStories || miniStories.length == 0 ? [] : [...miniStories.map(obj => (_miniStory(obj)))]


const userFields = ({ body }) => {
    const { _id = null, username, password, fullname, imgUrl } = body
    const following = _miniUsersArray(body.following)
    const followers = _miniUsersArray(body.followers)
    const bookmarkedStories = _miniStoriesArray(body.bookmarkedStories)
    let fields = { username, password, fullname, imgUrl, following, followers, bookmarkedStories } 
    fields = _id ? {...fields, _id} : fields    // When adding - server generates ID, as opposed to update
    return fields
}


const storyFields = ({ body }) => {
    const { _id = null, txt, imgUrl } = body
    const by = body.by ? _miniUser(body.by) : null
    const likedBy = _miniUsersArray(body.likedBy)
    const comments = _commentsArray(body)
    let fields = { txt, imgUrl, likedBy, comments } 
    fields = by ? {...fields, by} : fields      // When adding - server takes 'by' from 'loggedInUser', as opposed to update
    fields = _id ? {...fields, _id} : fields    // When adding - server generates ID, as opposed to update
    return fields
}


const _commentsArray = ({ comments }) => !comments || comments.length == 0 ? [] : [...comments.map(obj => (_commentFields(obj)))]
const _commentFields = (comment) => {
    const { _id, createdAt, txt } = comment
    const by =  _miniUser(comment.by)
    const likedBy = _miniUsersArray(comment.likedBy)
    return { _id, createdAt, txt, by, likedBy }
}


export const dataUtilsService = {
    userFields,
    storyFields
}



