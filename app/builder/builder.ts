import config from '../config/builder'
import path from 'path'
import Type from '../class/type'
import { uses, usesOf } from '../class/uses'

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
	let replacement_files = replacements[file]
	if (!replacement_files) {
		return superRequire.apply(this, arguments)
	}
	// from cache
	if (cache[file]) {
		return cache[file]
	}
	// string
	const type = superRequire.apply(this, [file]).default
	if (typeof replacement_files === 'string') {
		// replace
		const replacement_module = superRequire.apply(this, [replacement_files])
		if (replacement_module.default.prototype instanceof type) {
			return cache[file] = replacement_module
		}
		// compose
		replacement_files = [replacement_files]
	}
	// compose
	const replacement_types: Type[] = replacement_files.map(file => superRequire.apply(this, [file]).default)

	@uses(...replacement_types)
	class Built extends type {
		constructor()
		{
			super()
			usesOf(this).forEach(type => this[type.name]())
		}
	}

	return cache[file] = { default: Built }
}
