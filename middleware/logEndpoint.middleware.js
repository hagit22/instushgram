import { loggerService } from "../services/logger.service.js";


export function logRequest(req, res, next) {
	loggerService.debug(` Request:\r\n ${req.method} :: ${req.url} :: ${JSON.stringify(req.body)} \r\n`)
	next()
}

/* Response has to work with callback (on built-in events), 
because it occurs asynchronously, as opposed to request which occurs when it is sent-out */
export function logResponse(req, res, next) {
    res.on('finish', () => {
		loggerService.debug(` Response:  ${res.statusCode}\r\n`)
    });
    res.on('error', (error) => {
		loggerService.error(` Response:\r\n ${error.message}\r\n`)
    });
	next()
}

