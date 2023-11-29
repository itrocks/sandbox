
function dump(variable: any, indent: number = 0): string
{
	if (typeof variable === 'string') {
		return '"' + variable.replace('"', '\\"') + '"' + "\n"
	}
	if (typeof variable !== 'object') {
		return variable + "\n"
	}

	const isArray = Array.isArray(variable)
	const open    = isArray ? '[' : '{'
	const close   = isArray ? ']' : '}'
	let   out     = open + "\n"

	indent += 2
	for (let property in variable) {
		out += ' '.repeat(indent) + property + ': ' + dump(variable[property], indent)
	}
	indent -= 2

	return out + ' '.repeat(indent) + close + "\n"
}

export default dump
