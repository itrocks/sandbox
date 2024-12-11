import { SessionStore }                from '@fastify/session'
import { Session }                     from 'fastify'
import { readFile, unlink, writeFile } from 'node:fs/promises'

const cache: Record<string, Session> = {}

export default class FileStore implements SessionStore
{

	constructor(public directory: string)
	{}

	sessionFile(sessionId: string)
	{
		return this.directory + '/' + sessionId
	}

	set(sessionId: string, session: Session, callback: (error?: any) => void)
	{
		const string = JSON.stringify(session)
		if (cache[sessionId] && (string === JSON.stringify(cache[sessionId]))) {
			return callback()
		}
		cache[sessionId] = session
		writeFile(this.sessionFile(sessionId), JSON.stringify(session), 'utf8')
			.then(callback)
			.catch(error => { console.error(sessionId, 'set:', error); callback(error) })
	}

	get(sessionId: string, callback: (error: any, session?: Session | null) => void)
	{
		if (cache[sessionId]) {
			return callback(null, cache[sessionId])
		}
		readFile(this.sessionFile(sessionId))
			.then((data: Buffer|void) => {
				if (!data) {
					return callback(null)
				}
				const stringData = data + ''
				if (stringData === '') {
					return callback(null)
				}
				let session: Session
				try {
					session = JSON.parse(stringData)
				}
				catch (exception) {
					console.warn(sessionId, 'get:', exception)
					return callback(null)
				}
				cache[sessionId] = session
				callback(null, session)
			})
			.catch(_error => { callback(null) })
	}

	destroy(sessionId: string, callback: (error?: any) => void)
	{
		delete cache[sessionId]
		unlink(this.sessionFile(sessionId))
			.then(callback)
			.catch(error => { console.error(sessionId, 'destroy:', error); callback(error) })
	}

}
