import { KeyOf, objectOf, ObjectOrType, Type } from '../class/type'

export function decorate<T extends object>(name: Symbol, value: any)
{
	return (target: T, property: KeyOf<T>) => Reflect.defineMetadata(name, value, target, property)
}

export function decorateCallback<T extends object>(name: Symbol, callback: (target: Type<T>, property: KeyOf<T>) => any)
{
	return (target: Type<T>, property: KeyOf<T>) =>
		Reflect.defineMetadata(name, callback(target, property), target, property)
}

export function decoratorOf<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedValue?: V
): V
{
	return Reflect.getMetadata(name, objectOf(target), property)
		?? undefinedValue
}

export function decoratorOfCallback<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol,
	undefinedCallback: (target: ObjectOrType<T>, property: KeyOf<T>) => V
): V
{
	target = objectOf(target)
	return Reflect.getMetadata(name, target, property)
		?? undefinedCallback(target, property)
}
