import path          from 'path'
import Route         from '../action/route'
import { getRoute }  from '../action/routes'
import File          from '../class/file'
import config        from '../config/compose'
import { initClass } from '../orm/orm'
import { baseType }  from './type'
import { isAnyType } from './type'
import Type          from './type'
import Uses          from './uses'

type SubstitutionModule = { __esModule: true, default?: Type }

function applyFileToType(module: any, file: string)
{
	const type = module?.default
	if (!isAnyType(type)) return module

	let realType = baseType(type)
	File(file)(realType)

	const route = getRoute(file.slice(0, -3))
	if (route) {
		Route(route)(realType)
	}

	const withORM = initClass(type)
	if (withORM) {
		module.default = withORM
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

const cache: Record<string, SubstitutionModule> = {}
const Module = require('module')
const superRequire: (...args: any) => typeof Module = Module.prototype.require

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
		return cache[file] = applyFileToType(superRequire.call(this, ...arguments), file)
	}
	// require parent
	const module: SubstitutionModule = { __esModule: true }
	cache[file]        = module
	const parentModule = applyFileToType(superRequire.call(this, ...arguments), file)
	// compose
	if (typeof replacementFiles !== 'object') {
		replacementFiles = [replacementFiles]
	}
	const replacementTypes = replacementFiles.map((file): Type => this.require(file).default)
	module.default = Uses(...replacementTypes)(parentModule.default)
	return module
}
