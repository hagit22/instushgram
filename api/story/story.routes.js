import express from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware.js'
import { logRequest, logResponse } from '../../middleware/logEndpoint.middleware.js'
import { storyController } from './story.controller.js'

const router = express.Router()


router.get('/', logRequest, logResponse, storyController.getStories)
router.get('/:storyId', logRequest, logResponse, storyController.getStory)
router.delete('/:storyId', logRequest, requireAuth, logResponse, storyController.removeStory)
router.post('/', logRequest, requireAuth, logResponse, storyController.addStory)
router.put('/', logRequest, requireAuth, logResponse, storyController.updateStory)



export const storyRoutes = router 