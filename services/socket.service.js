import { Server } from 'socket.io'

export const socketService = {
    initialize,
    notifyUser,
    broadcast,
}

export const notificationTypes = {
    newUser: 'new-user',                    // gets: { newUserId, newUserImgUrl, newUserName }
    newFollower: 'new-follower',            // gets: { newFollowerId }
    newStory: 'new-story',                  // gets: { newStoryId }
    storyByFollowing: 'story-by-following'  // gets: { followingUserId, storyImgUrl }
}

const clientMessages = {
    userIdentify: 'user-identify',  // gets: { sendingUserId }
    userFollow: 'user-follow',      // gets: { followingUserId }
    userPost: 'user-post'           // gets: { followersList, storyId }
}


let socketsHandler = null
let openSockets = []

function initialize(nodeServer) {
    socketsHandler = new Server(nodeServer, {cors: {origin: '*'}})

    console.log("got socket handler")

    socketsHandler.engine.on("connection_error", (err) => {
        console.log("Socket Error: ")
        console.log("err-code: ",err.code);     
        console.log("err-message: ",err.message);  
        console.log("err-context: ",err.context);  
        //console.log("err-request: ",err.req);      
    });
    
    socketsHandler.engine.on('connection', connectedSocket => {
        
        console.log("Socket connected: ",connectedSocket.id)
        openSockets.push(connectedSocket)
        
        connectedSocket.on('disconnect', () => {
            console.log("Socket disconnect was fired",openSockets)
            openSockets = openSockets.filter(socket => socket.id !== connectedSocket.id)
        })
        
        connectedSocket.on(clientMessages.userIdentify, ({sendingUserId}) => {
            console.log("Client-msg: userIdentify: ",sendingUserId)
            connectedSocket.userId = sendingUserId
        })
        
        connectedSocket.on(clientMessages.userFollow, ({followingUserId}) => {
            console.log("Client-msg: userFollow: ",followingUserId)
            notifyUser(followingUserId, 
                notificationTypes.newFollower, 
                {newFollowerId: connectedSocket.userId})
        })
        
        connectedSocket.on(clientMessages.userStory, ({followersList, storyImgUrl}) => {
            console.log("Client-msg: userStory: ",storyImgUrl)
            followersList.forEach(follower => {
                notifyUser(follower._id, 
                    notificationTypes.storyByFollowing, 
                    {followingUserId: connectedSocket.userId, storyImgUrl})
            })
        })
    })
}

function notifyUser(toUserId, notificationType, data) {
    try {
        console.log("notifyUser: ",toUserId, notificationType, data)
        const toUserSocket = openSockets.filter(socket => socket.userId === toUserId)[0]
        if (!toUserSocket) {
            console.log("notifyUser: notification not emitted ",notificationType) 
            return
        }
        toUserSocket.emit(notificationType, data)
    }
    catch(err) {
        console.log("notifyUser Error: ",notificationType, err)
    }
}

function broadcast(sendingUserId, notificationType, data) {
    try {
        console.log("Broadcast: ",sendingUserId, notificationType, data)
        const sendingUserSocket = openSockets.filter(socket => socket.userId === sendingUserId)[0]
        if (sendingUserSocket) 
            sendingUserSocket.broadcast.emit(notificationType, data)    // Broadcasting to all users, excluding the sending user
        else 
            socketsHandler.emit(notificationType, data)    // Broadcasting to all users, including the sending user
    }
    catch(err) {
        console.log("Broadcast Error: ",notificationType, err)
    }
}

/*function _getUserSocket(allSockets, userId) {
    console.log("getUserSocket: openSockets = ",openSockets)
    const userSocketObj = openSockets.find(socketObj => socketObj.userId === userId) 
    if (!userSocketObj) return null
    return allSockets.find(socket => socket.id === userSocketObj.socketId)
}*/


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

