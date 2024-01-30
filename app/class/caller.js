/**
 * Unused:
 *
 * This would work only if caller is compiled in non-strict mode, without "use strict":
 * getThis() is unavailable without this option, so it does not work for now.
 *
 * Caller.js being written in pure-js and without "use string": is not enough: the caller should too.
 */

Object.defineProperty(exports, '__esModule', { value: true })
exports.default = function caller() {
	const prepareStackTrace = Error.prepareStackTrace
	Error.prepareStackTrace = (_, stack) => stack
	const error = new Error
	Error.captureStackTrace(error, arguments.callee)
	const stack = error.stack
	Error.prepareStackTrace = prepareStackTrace
	// noinspection JSUnresolvedReference prepareStackTrace has been overriden to get stack object instead of string
	return stack[0].getThis()
}
