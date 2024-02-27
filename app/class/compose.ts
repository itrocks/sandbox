import path     from 'path'
import config   from '../config/compose'
import Type     from './type'
import { uses } from './uses'

const replacements: { [p: string]: string | string[] } = Object.fromEntries(
	Object.entries(config).map(([module, replacement]) => [
		path.normalize(require.resolve('..' + module)),
		(typeof replacement === 'string')
			? path.normalize(require.resolve('..' + replacement))
			: replacement.map(replacement => path.normalize(require.resolve('..' + replacement)))
	])
)

const cache: { [type: string]: any } = {}
const Module = require('module')
const superRequire: (...args: any) => any = Module.prototype.require

Module.prototype.require = function(file: string)
{
	// resolve and normalize
	if (file.startsWith('.')) {
		file = this.path + (this.path.endsWith('/') ? '' : '/') + file
	}
	file = path.normalize(require.resolve(file))
	// no replacement
	let replacementFiles = replacements[file]
	if (!replacementFiles) {
		return superRequire.apply(this, arguments)
	}
	// from cache
	if (cache[file]) {
		return cache[file]
	}
	// require parent
	const module: { __esModule: true, default?: Type } = { __esModule: true }
	cache[file] = module
	const parentModule = superRequire.apply(this, arguments)
	// compose
	if (typeof replacementFiles === 'string') {
		replacementFiles = [replacementFiles]
	}
	const replacementTypes: Type[] = replacementFiles.map(file => superRequire.call(this, file).default)
	module.default = uses(parentModule.default, replacementTypes)
	return module
}
