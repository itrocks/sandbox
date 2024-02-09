import { objectOf, Type } from '../class/type'

export function decorate<T>(name: Symbol, value: T)
{
	return (target: object, property: string) => Reflect.defineMetadata(name, value, target, property)
}

export function decorateCallback<T>(name: Symbol, callback: (target: Type, property: string) => T)
{
	return (target: Type, property: string) => Reflect.defineMetadata(name, callback(target, property), target, property)
}

export function decoratorOf<T>(target: object|Type, property: string, name: Symbol, undefinedValue: T): T
{
	const result = Reflect.getMetadata(name, objectOf(target), property)
	return (result === undefined) ? undefinedValue : result
}

export function decoratorOfCallback<T>(
	target: object|Type, property: string, name: Symbol, undefinedCallback: (target: object, property: string) => T
): T
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target, property)
	return (result === undefined) ? undefinedCallback(target, property) : result
}
