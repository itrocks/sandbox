import { objectOf, Type } from '../class/type'

export function decorate<T>(name: Symbol, value: T)
{
	return (target: Type) => Reflect.defineMetadata(name, value, target.prototype)
}

export function decorateCallback<T>(name: Symbol, callback: (target: Type) => T)
{
	return (target: Type) => Reflect.defineMetadata(name, callback(target), target.prototype)
}

export function decoratorOf<T>(target: object | Type, name: Symbol, undefinedValue: T): T
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedValue : result
}

export function decoratorOfCallback<T>(target: object | Type, name: Symbol, undefinedCallback: (target: object) => T): T
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedCallback(target) : result
}
