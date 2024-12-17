import { ObjectOrType, Type, typeOf } from '@itrocks/class-type'

export function decorate<T extends object>(name: Symbol, value: any)
{
	return (target: Type<T>) => Reflect.defineMetadata(name, value, target)
}

export function decorateCallback<T extends object>(name: Symbol, callback: (target: Type<T>) => any)
{
	return (target: Type<T>) => Reflect.defineMetadata(name, callback(target), target)
}

export function decoratorOf<V>(target: ObjectOrType, name: Symbol, undefinedValue: V): V
{
	const result = Reflect.getMetadata(name, typeOf(target))
	return (result === undefined) ? undefinedValue : result
}

export function decoratorOfCallback<T extends object, V>(
	target: ObjectOrType<T>, name: Symbol, undefinedCallback?: (target: Type<T>) => V
): V
{
	target = typeOf(target)
	return Reflect.getMetadata(name, target) ?? undefinedCallback?.(target)
}

export type DecoratorOfType<V = any> = (target: ObjectOrType, name: Symbol, undefinedValue: V) => V
