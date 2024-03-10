import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { storyRoutes } from './api/story/story.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'


const app = express()
const port = process.env.PORT || 3034   // specifying port numbers - allows to differentiate between multiple services at one domain/address

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

// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


app.listen(port, () => console.log(`Instushgram Server is ready for your requests! Listening on port ${port}!`))





  
