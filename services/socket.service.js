import { Server } from 'socket.io'

export const socketService = {
    initialize,
    notifyUser,
    broadcast,
}

const clientMessages = {
    userIdentify: 'user-identify',  // gets: { sendingUserId }
    userFollow: 'user-follow',      // gets: { followingUserId }
    userPost: 'user-post'           // gets: { followersList, storyId }
}

export const notificationTypes = {
    newUser: 'new-user',                    // gets: { newUserId }
    newFollower: 'new-follower',            // gets: { newFollowerId }
    newStory: 'new-story',                  // gets: { newStoryId }
    storyByFollowing: 'story-by-following'  // gets: { followingUserId, storyId }
}

const notificationMessages = {
    newUser: 'just joined Instushgram', //'who you might know is on Instushgram',
    newFollower: 'started following you',
    storyByFollowing: 'posted a thread you might like',
    none: ''
}


let socketsHandler = null
let openSocketsList = []

function initialize(nodeServer) {
    socketsHandler = new Server(nodeServer, {cors: {origin: '*'}})

    console.log("got socket handler")

    socketsHandler.engine.on("connection_error", (err) => {
        //console.log(err.req);      // the request object
        console.log("Socket Error: ")
        console.log(err.code);     // the error code, for example 1
        console.log(err.message);  // the error message, for example "Session ID unknown"
        console.log(err.context);  // some additional error context
    });
    
    socketsHandler.engine.on('connection', connectedSocket => {
        
        console.log("socket connection: ",connectedSocket.id)
        openSocketsList.push({socketId: connectedSocket.id})
        console.log("socket connection: openSocketsList: ",openSocketsList)
        
        connectedSocket.on('disconnect', () => {
            console.log("socket disconnect was fired",openSocketsList)
            openSocketsList = openSocketsList.filter(socketObj => socketObj.socketId !== connectedSocket.id)
            console.log("socket disconnect: ",openSocketsList)
        })
        
        connectedSocket.on(clientMessages.userIdentify, ({sendingUserId}) => {
            console.log("userIdentify: ",sendingUserId)
            openSocketsList = openSocketsList.map(socketObj => 
                socketObj.socketId === connectedSocket.id ? {...socketObj, userId: sendingUserId} : socketObj)
            console.log("userIdentify: ",openSocketsList)
        })
        
        connectedSocket.on(clientMessages.userFollow, ({followingUserId}) => {
            console.log("userFollow: ",followingUserId)
            notifyUser(followingUserId, 
                notificationTypes.newFollower, notificationMessages.newFollower,
                {newFollowerId: connectedSocket.userId})
        })
        
        connectedSocket.on(clientMessages.userStory, ({followersList, storyId}) => {
            console.log("userStory: ",storyId)
            followersList.forEach(follower => {
                notifyUser(follower._id, 
                    notificationTypes.storyByFollowing, notificationMessages.storyByFollowing, 
                    {followingUserId: connectedSocket.userId, storyId})
            })
        })
    })
}

async function notifyUser(toUserId, notificationType, notificationMessage, data) {
    try {
        const allSockets = await socketsHandler.fetchSockets()
        console.log("Emitting: ",allSockets)
        const toUserSocket = _getUserSocket(allSockets, toUserId)
        if (!toUserSocket) 
            return
        toUserSocket.emit(notificationType, data)
    }
    catch(err) {
        console.log("notifyUser Error: ",err)
    }
}

async function broadcast(sendingUserId, notificationType, data) {
    try {
        const allSockets = await socketsHandler.fetchSockets()
        console.log("Broadcast: ",sendingUserId, allSockets.length, data)
        const sendingUserSocket = _getUserSocket(allSockets, sendingUserId)
        console.log("sending socket: ",sendingUserSocket)
        if (sendingUserSocket) 
            sendingUserSocket.broadcast.emit(notificationType, data)
        else {
            console.log("Broadcast data: ",notificationType, data)
            socketsHandler.emit(notificationType, data)
        }
    }
    catch(err) {
        console.log("notifyUser Error: ",err)
    }
}

function _getUserSocket(allSockets, userId) {
    console.log("getUserSocket: openSocketsList = ",openSocketsList)
    const userSocketObj = openSocketsList.find(socketObj => socketObj.userId === userId) 
    if (!userSocketObj) return null
    return allSockets.find(socket => socket.id === userSocketObj.socketId)
}


/* Will be done by client!
function _addNotificationMessage(toUser, notificationMessage) {
    if (notificationMessage === notificationMessages.none)
        return
    const notificationMessage = userService.generateNotification  ==> WILL BE DONE BY CLIENT!!!
    const userToSave = {...toUser, notifications: [notificationMessage, ...toUser.notifications]}
    console.log("user to save: ",userToSave)
    userService.save(userToSave)
    //userService.save({...toUser, notifications: [notificationMessage, ...toUser.notifications]})
}*/

