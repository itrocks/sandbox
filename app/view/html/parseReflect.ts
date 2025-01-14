import { ReflectClass }    from '@itrocks/reflect'
import { ReflectProperty } from '@itrocks/reflect'

export default function parseReflect(variable: string, data: any)
{
	const typeOfDataChar = (typeof data)[0]
	if ((typeOfDataChar !== 'f') && (typeOfDataChar !== 'o')) {
		throw 'Could not parse ' + variable + ' for non-object ' + data
	}
	if (!((data instanceof ReflectClass) || (data instanceof ReflectProperty))) {
		data = new ReflectClass(data)
	}
	const value = data[variable.substring(1)]
	return ((typeof value)[0] === 'f')
		? value.call(data)
		: value
}
