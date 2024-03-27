import Cryptr from 'cryptr'
import bcryptjs from 'bcryptjs'
import { socketService, notificationTypes } from '../../services/socket.service.js'
import { loggerService } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'Instushgram-Secret')

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
}


async function signup(username, password, fullname, imgUrl) {
    try {
        const saltRounds = 10
        const hash = await bcryptjs.hash(password, saltRounds)
        const user = await userService.save({ username, password: hash, fullname, imgUrl: imgUrl || '' })
        socketService.broadcast(user._id, notificationTypes.newUser, 
            {newUserId: user._id, newUserImgUrl: user.imgUrl, newUserName: user.username})
        return user
    }
    catch (err) {
        loggerService.error('failed to signup')
        throw(err)
    }
}

async function login(username, password) {
    try {
        const user = await userService.getByUsername(username, true)
        if (!user) 
            throw 'Unknown username'
        const match = await bcryptjs.compare(password, user.password)
        if (!match) 
            throw 'Invalid username or password'
        const miniUser = {_id: user._id, username: user.username, imgUrl: user.imgUrl}
        return miniUser
    }
    catch (err) {
        loggerService.error('service failed to login')
        throw(err)
    }
}

function getLoginToken(user) {
    try {
        const jsonStr = JSON.stringify(user)
        const encryptedStr = cryptr.encrypt(jsonStr)
        return encryptedStr
    }
    catch (err) {
        loggerService.error('failed to get login token')
        throw(err)
    }
}

function validateToken(token) {
    try {
        const jsonStr = cryptr.decrypt(token)
        const loggedinUser = JSON.parse(jsonStr)
        return loggedinUser
    } 
    catch (err) {
        loggerService.error('failed to validate token')
        //throw(err)
    }
    return null // 'not-null' will be checked in middleware. thats why i commented out the 'throw' above...
}



