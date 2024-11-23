import { objectOf, ObjectOrType, Type } from '../class/type'

export function decorate<T extends object>(name: Symbol, value: any)
{
	return (target: Type<T>) => Reflect.defineMetadata(name, value, target.prototype)
}

export function decorateCallback<T extends object>(name: Symbol, callback: (target: Type<T>) => any)
{
	return (target: Type<T>) => Reflect.defineMetadata(name, callback(target), target.prototype)
}

export function decoratorOf<V>(target: ObjectOrType, name: Symbol, undefinedValue: V): V
{
	target = objectOf(target)
	const result = Reflect.getMetadata(name, target)
	return (result === undefined) ? undefinedValue : result
}

export function decoratorOfCallback<V>(target: ObjectOrType, name: Symbol): V
export function decoratorOfCallback<V, T extends object>(target: ObjectOrType<T>, name: Symbol, undefinedCallback: (target: T) => V): V
export function decoratorOfCallback<V, T extends object>(target: ObjectOrType<T>, name: Symbol, undefinedCallback?: (target: T) => V): V | undefined
{
	target = objectOf(target)
	return Reflect.getMetadata(name, target) ?? undefinedCallback?.(target)
}

export type DecoratorOfType<V = any> = (target: ObjectOrType, name: Symbol, undefinedValue: V) => V
