import 'reflect-metadata'
import Type from '../class/type'

function decorate(name: string, value: any)
{
	return (target: Type) => Reflect.defineMetadata(name, value, target.prototype)
}

function decorateCallback(name: string, callback: (target:Type)=>any)
{
	return (target: Type) => Reflect.defineMetadata(name, callback(target), target.prototype)
}

function decoratorOf<T>(target: object|Type, name: string, undefined_value: T): T
{
	if (typeof target !== 'object') {
		target = new target
	}
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefined_value : result
}

export { decorate, decorateCallback, decoratorOf }
