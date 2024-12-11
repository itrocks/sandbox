import { isAnyFunction } from '../class/type'

export default function dump(variable: any, indent: number = 0): string
{
	const typeOfVariable = typeof variable
	if (typeOfVariable === 'string') {
		return '"' + variable.replace('"', '\\"') + '"\n'
	}
	if (typeOfVariable[0] !== 'o') {
		return variable + '\n'
	}

	const isArray       = Array.isArray(variable)
	const [open, close] = isArray ? ['[', ']'] : ['{', '}']
	let   out           = open + '\n'

	indent ++
	for (const property in variable) {
		const value = variable[property]
		if (isAnyFunction(value)) {
			continue
		}
		out += '\t'.repeat(indent) + property + ': ' + dump(value, indent)
	}
	indent --

	return out + '\t'.repeat(indent) + close + '\n'
}
