
function dump(variable: any, indent: number = 0): string
{
	if (typeof variable === 'string') {
		return '"' + variable.replace('"', '\\"') + '"' + "\n"
	}
	if (typeof variable !== 'object') {
		return variable + "\n"
	}

	const is_array = Array.isArray(variable)
	const open     = is_array ? '[' : '{'
	const close    = is_array ? ']' : '}'
	let   out      = open + "\n"

	indent += 2
	for (let property in variable) {
		out += ' '.repeat(indent) + property + ': ' + dump(variable[property], indent)
	}
	indent -= 2

	return out + ' '.repeat(indent) + close + "\n"
}

export default dump
