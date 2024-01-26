
const Module = require('module')
const superRequire = Module.prototype.require

Module.prototype.require = function (file: string)
{
	console.log('require built', file)
	return superRequire.call(this, file)
}

import './import-to-require-dependency.js'
