import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'node:http'
import { socketService } from './services/socket.service.js'
import { storyRoutes } from './api/story/story.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'


const app = express()
const port = process.env.PORT || 3035   // specifying port numbers - allows to differentiate between multiple services at one domain/address

const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], 
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// Modules Routes
app.use('/api/story', storyRoutes)
//app.use('/api/msg', msgRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)

const nodeServer = createServer(app)
socketService.initialize(nodeServer)

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

nodeServer.listen(port, () => console.log(`Instushgram Server is ready for your requests! Listening on port ${port}!`))





  
