import Type             from '../class/type'
import { Uses, usesOf } from '../class/uses'
import config           from '../config/builder'
import BuiltDecorator   from './built'
import path             from 'path'

const replacements: { [p: string]: string|string[] } = Object.fromEntries(
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
	// string
	const type: Type = superRequire.apply(this, arguments).default
	if (typeof replacementFiles === 'string') {
		// replace
		const replacementModule = superRequire.apply(this, [replacementFiles])
		if (replacementModule.default.prototype instanceof type) {
			return cache[file] = replacementModule
		}
		// compose
		replacementFiles = [replacementFiles]
	}
	// compose
	const replacementTypes: Type[] = replacementFiles.map(file => superRequire.apply(this, [file]).default)

	@BuiltDecorator()
	@Uses(...replacementTypes)
	class Built extends type {
		[property:string]:any
		constructor()
		{
			super()
			usesOf(this).forEach(type => this[type.name]())
		}
	}

	return cache[file] = { __esModule: true, default: Built }
}
