import { readFileSync } from 'node:fs'

const staticRoutes: Record<string, string | undefined>
	= JSON.parse(readFileSync(__dirname + '/static-routes.json') + '')

export default staticRoutes
