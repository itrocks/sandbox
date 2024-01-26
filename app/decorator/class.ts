import { objectOf, Type } from '../class/type'

function decorate(name: string, value: any)
{
	return (target: Type) => Reflect.defineMetadata(name, value, target.prototype)
}

function decorateCallback(name: string, callback: (target: Type) => any)
{
	return (target: Type) => Reflect.defineMetadata(name, callback(target), target.prototype)
}

function decoratorOf<T>(target: object|Type, name: string, undefinedValue: T): T
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedValue : result
}

function decoratorOfCallback<T>(target: object|Type, name: string, undefinedCallback: (target: object) => T): T
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedCallback(target) : result
}

export { decorate, decorateCallback, decoratorOf, decoratorOfCallback }
