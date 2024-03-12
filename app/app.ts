import { existsSync } from 'node:fs'
import path           from 'path'

const appPath = existsSync(__dirname + '/../../../node_modules')
	? path.normalize(__dirname + '/../../..')
	: path.normalize(__dirname + '/..')

export { appPath }
