import BuiltDecorator from './built'
import config from '../config/builder'
import path from 'path'
import Type from '../class/type'
import { Uses, usesOf } from '../class/uses'

const replacements: {[p:string]:string|string[]} = Object.fromEntries(
	Object.entries(config).map(([module, replacement]) => [
		path.normalize(require.resolve('..' + module)),
		(typeof replacement === 'string')
			? path.normalize(require.resolve('..' + replacement))
			: replacement.map(replacement => path.normalize(require.resolve('..' + replacement)))
	])
)

const cache: {[type:string]:any} = {}

const Module = require('module')

const superRequire = Module.prototype.require

Module.prototype.require = function(file: string)
{
	if (file.startsWith('.')) {
		file = (this.path.substring(0, this.path.lastIndexOf('/')) + '/' + file)
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
	const type = superRequire.apply(this, [file]).default
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
		constructor()
		{
			super()
			usesOf(this).forEach(type => this[type.name]())
		}
	}

	return cache[file] = { default: Built }
}
