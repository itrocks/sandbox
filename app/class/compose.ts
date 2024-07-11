import path         from 'path'
import Route        from '../action/route'
import { getRoute } from '../action/routes'
import File         from '../class/file'
import config       from '../config/compose'
import Type         from './type'
import Uses         from './uses'

type SubstitutionModule = { __esModule: true, default?: Type }

function applyFileToType(module: any, file: string)
{
	const type = module.default
	if (((typeof type)[0] === 'f') && (type.toString()[0] === 'c')) {
		File(file)(type)
		const route = getRoute(file.slice(0, -3))
		if (route) {
			Route(route)(type)
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
const superRequire = Module.prototype.require as (...args: any) => typeof Module

Module.prototype.require = function(file: string)
{
	// resolve and normalize
	if (file.startsWith('.')) {
		file = this.path + (this.path.endsWith('/') ? '' : '/') + file
	}
	file = path.normalize(require.resolve(file))
	// from cache
	if (cache[file]) {
		return cache[file]
	}
	// no replacement
	let replacementFiles = replacements[file]
	if (!replacementFiles) {
		return cache[file] = applyFileToType(superRequire.apply(this, arguments as unknown as any[]), file)
	}
	// require parent
	const module       = { __esModule: true } as SubstitutionModule
	cache[file]        = module
	const parentModule = applyFileToType(superRequire.apply(this, arguments as unknown as any[]), file)
	// compose
	if (typeof replacementFiles !== 'object') {
		replacementFiles = [replacementFiles]
	}
	const replacementTypes = replacementFiles.map(file => this.require(file).default as Type)
	module.default = Uses(...replacementTypes)(parentModule.default)
	return module
}
