import express from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware.js'
import { logRequest, logResponse } from '../../middleware/logEndpoint.middleware.js'
import { msgController } from './msg.controller.js'

const router = express.Router()


router.get('/', logRequest, logResponse, msgController.getMsgs)
router.get('/:msgId', logRequest, logResponse, msgController.getMsg)
router.delete('/:msgId', logRequest, requireAuth, logResponse, msgController.removeMsg)
router.post('/', logRequest, requireAuth, logResponse, msgController.addMsg)
router.put('/', logRequest, requireAuth, logResponse, msgController.updateMsg)



export const msgRoutes = router 