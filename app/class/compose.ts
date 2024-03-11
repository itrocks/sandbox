import path         from 'path'
import Route        from '../action/route'
import { getRoute } from '../action/routes'
import config       from '../config/compose'
import Type         from './type'
import { uses }     from './uses'

type SubstitutionModule = { __esModule: true, default?: Type }

function addRouteToModule(module: any, file: string)
{
	if (
		(typeof module.default === 'function')
		&& (module.default.toString().startsWith('class '))
	) {
		const route = getRoute(file.substring(0, file.length - 3))
		if (route) {
			Route(route)(module.default)
		}
	}
	return module
}

const replacements = Object.fromEntries(
	Object.entries(config).map(([module, replacement]) => [
		path.normalize(require.resolve('..' + module)),
		(typeof replacement === 'object')
			? replacement.map(replacement => path.normalize(require.resolve('..' + replacement)))
			: path.normalize(require.resolve('..' + replacement))
	])
)

const cache        = {} as { [type: string]: SubstitutionModule }
const Module       = require('module')
const superRequire = Module.prototype.require as (...args: any) => any

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
		return addRouteToModule(superRequire.apply(this, arguments), file)
	}
	// from cache
	if (cache[file]) {
		return cache[file]
	}
	// require parent
	const module = { __esModule: true } as SubstitutionModule
	cache[file]  = module
	const parentModule = superRequire.apply(this, arguments)
	// compose
	if (typeof replacementFiles !== 'object') {
		replacementFiles = [replacementFiles]
	}
	const replacementTypes = replacementFiles.map(file => superRequire.call(this, file).default as Type)
	module.default = uses(parentModule.default, replacementTypes)
	return module
}
