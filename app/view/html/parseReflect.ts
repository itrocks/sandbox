import ReflectClass    from '../../class/reflect'
import ReflectProperty from '../../property/reflect'

export default function parseReflect(variable: string, data: any)
{
	const typeOfData = typeof data
	if (((typeOfData !== 'object') && (typeOfData !== 'function')) || (typeOfData === 'function') && !data.prototype) {
		throw 'Could not parse ' + variable + ' for non-object ' + data
	}
	if (!((data instanceof ReflectClass) || (data instanceof ReflectProperty))) {
		data = new ReflectClass(data)
	}
	const value = data[variable.substring(1)]
	return (typeof value === 'function')
		? value.call(data)
		: value
}
