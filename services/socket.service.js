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
    userIdentify: 'user-identify',  // gets: { connectedUserId, connectedUsername }
    userFollow: 'user-follow',      // gets: { followingUserId }
    userPost: 'user-post'           // gets: { followersIdList, storyImgUrl }
}


let socketsHandler = null
let openSockets = []

function initialize(nodeServer) {
    socketsHandler = new Server(nodeServer, {cors: {origin: '*'}})

    console.log("got socket handler")

    socketsHandler.on("connection_error", (err) => {
        console.log("Socket Error: ")
        console.log("err-code: ",err.code);     
        console.log("err-message: ",err.message);  
        console.log("err-context: ",err.context);  
        //console.log("err-request: ",err.req);      
    });
    
    socketsHandler.on('connection', connectedSocket => {
        
        console.log("Socket connected: ",connectedSocket.id)
        openSockets.push(connectedSocket)
        
        connectedSocket.on('disconnect', () => {
            console.log("Socket disconnect was fired: ",connectedSocket.id)
            openSockets = openSockets.filter(socket => socket.id !== connectedSocket.id)
            _printSocketList()
        })
        
        connectedSocket.on(clientMessages.userIdentify, ({connectedUserId, connectedUsername}) => {
            console.log("Client-msg: userIdentify: ",connectedUserId, connectedUsername)
            connectedSocket.userId = connectedUserId
            connectedSocket.username = connectedUsername
            _printSocketList()
        })
        
        connectedSocket.on(clientMessages.userFollow, ({followingUserId}) => {
            console.log("Client-msg: userFollow: ",connectedSocket.userId, followingUserId)
            notifyUser(followingUserId, 
                notificationTypes.newFollower, 
                {newFollowerId: connectedSocket.userId})
        })
        
        connectedSocket.on(clientMessages.userPost, ({followersIdList, storyImgUrl}) => {
            console.log("Client-msg: userPost: ",connectedSocket.userId, storyImgUrl)
            followersIdList.forEach(followerId => {
                notifyUser(followerId, notificationTypes.storyByFollowing, 
                    {followingUserId: connectedSocket.userId, storyImgUrl})
            })
        })
    })
}

function notifyUser(toUserId, notificationType, data) {
    try {
        console.log("notifyUser: ",toUserId, notificationType, data)
        //_printSocketList()
        const toUserSocket = openSockets.filter(socket => socket.userId === toUserId)[0]
        if (!toUserSocket) {
            console.log("notifyUser: notification not emitted ",notificationType) 
            return
        }
        console.log("NotifyUser: to-user socket.id: ",toUserSocket.id)
        toUserSocket.emit(notificationType, data)
    }
    catch(err) {
        console.log("notifyUser Error: ",notificationType, err)
    }
}

function broadcast(sendingUserId, notificationType, data) {
    try {
        console.log("Broadcast: ",sendingUserId, notificationType, data)
        //_printSocketList()
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

function _printSocketList() {
    console.log("Current open sockets: ",openSockets.length,":")
    openSockets.forEach(openSocket => console.log("       ",openSocket.id,": ",openSocket.userId,"-",openSocket.username))
}

