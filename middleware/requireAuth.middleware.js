import { authService } from "../api/auth/auth.service.js";


export function requireAuth(req, res, next) {
	const loggedinUser = authService.validateToken(req.cookies.loginToken)
	if (!loggedinUser) 
		return res.status(401).send('Not authenticated')
	req.loggedinUser = loggedinUser // Add this info to the request as it keeps on 'rolling' to next stage...
	next()
}

