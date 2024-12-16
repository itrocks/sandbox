import { KeyOf, ObjectOrType, prototypeOf } from '../class/type'

export type DecorateCaller<T extends object> = (target: T, property: KeyOf<T>) => void

export function decorate<T extends object>(name: Symbol, value: any)
	: DecorateCaller<T>
{
	return (target: T, property: KeyOf<T>) => Reflect.defineMetadata(name, value, target, property)
}

export function decorateCallback<T extends object>(name: Symbol, callback: (target: T, property: KeyOf<T>) => any)
	: DecorateCaller<T>
{
	return (target: T, property: KeyOf<T>) =>
		Reflect.defineMetadata(name, callback(target, property), target, property)
}

export function decoratorOf<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol, undefinedValue?: V
): V
{
	return Reflect.getMetadata(name, prototypeOf(target), property)
		?? undefinedValue
}

export function decoratorOfCallback<V, T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, name: Symbol,
	undefinedCallback: (target: T, property: KeyOf<T>) => V
): V
{
	target = prototypeOf(target)
	return Reflect.getMetadata(name, target, property)
		?? undefinedCallback(target, property)
}
