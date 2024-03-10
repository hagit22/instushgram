import { loggerService } from '../../services/logger.service.js';
import { userService } from '../user/user.service.js';
import { authService } from './auth.service.js'

export async function signup(req, res) {
    try {
        const { username, password, fullname, imgUrl } = req.body
        loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)  // Never log passwords
        if (!username || !password || !fullname) 
            throw 'Missing required signup information'
        if (await userService.doesUserExist(username))
            throw 'Username already taken'
        const account = await authService.signup(username, password, fullname, imgUrl)
        loggerService.info(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(username, password)
        loggerService.info('User signup-login:', user)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } 
    catch (err) {
        loggerService.error('Failed to signup ' + err)
        res.status(400).send('Failed to signup : ' + err )
    }
}

export async function login(req, res) {
    try {
        const { username, password } = req.body
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        loggerService.info('User login: ', user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } 
    catch (err) {
        loggerService.error('Failed to Login ' + err)
        res.status(401).send('Failed to Login : ' + err )
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send( 'Logged out successfully' )
    } 
    catch (err) {
        loggerService.error('Failed to logout ' + err)
        res.status(400).send('Failed to logout : ' + err )
    }
}