import express from 'express'
import { logRequest, logResponse } from '../../middleware/logEndpoint.middleware.js'
import { userController } from './user.controller.js'

const router = express.Router()


router.get('/', logRequest, logResponse, userController.getUsers)
router.get('/u/:userId', logRequest, logResponse, userController.getUserById)
router.get('/:userName', logRequest, logResponse, userController.getUserByName)
router.delete('/u/:userId', logRequest, logResponse, userController.removeUser)
router.post('/', logRequest, logResponse, userController.addUser)
router.put('/', logRequest, logResponse, userController.updateUser)



export const userRoutes = router