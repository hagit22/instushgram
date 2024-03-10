import express from 'express'
import { logRequest, logResponse } from '../../middleware/logEndpoint.middleware.js'
import { login, logout, signup } from './auth.controller.js'

const router = express.Router()

router.post('/login', logRequest, logResponse, login)
router.post('/signup', logRequest, logResponse, signup)
router.post('/logout', logRequest, logResponse, logout)

export const authRoutes = router