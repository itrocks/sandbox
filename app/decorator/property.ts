import { objectOf, Type } from '../class/type'

function decorate<T>(name: Symbol, value: T)
{
	return (target: object, property: string) => Reflect.defineMetadata(name, value, target, property)
}

function decorateCallback<T>(name: Symbol, callback: (target: Type, property: string) => T)
{
	return (target: Type, property: string) => Reflect.defineMetadata(name, callback(target, property), target, property)
}

function decoratorOf<T>(target: object|Type, property: string, name: Symbol, undefinedValue: T): T
{
	const result = Reflect.getMetadata(name, objectOf(target), property)
	return (result === undefined) ? undefinedValue : result
}

function decoratorOfCallback<T>(
	target: object|Type, property: string, name: Symbol, undefinedCallback: (target: object, property: string) => T
): T
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target, property)
	return (result === undefined) ? undefinedCallback(target, property) : result
}

export { decorate, decorateCallback, decoratorOf, decoratorOfCallback }
