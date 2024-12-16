
export function baseType<T extends object>(target: Type<T>): Type<T>
{
	while ((target.name === '') || (target.name === 'BuiltClass')) {
		target = Object.getPrototypeOf(target)
	}
	return target
}

export const isAnyFunction = (value: any): value is Function =>
	((typeof value)[0] === 'f') && ((value + '')[0] !== 'c')

export const isAnyFunctionOrType = (value: any): value is Function | Type =>
	(typeof value)[0] === 'f'

export const isAnyObject = <T extends object = object>(value: any): value is T =>
	(value && ((typeof value)[0] === 'o'))

export const isAnyType = (value: any): value is Type =>
	((typeof value)[0] === 'f') && ((value + '')[0] === 'c')

export const isObject = <T extends object>(target: ObjectOrType<T>): target is T       => (typeof target)[0] === 'o'
export const isType   = <T extends object>(target: ObjectOrType<T>): target is Type<T> => (typeof target)[0] === 'f'

export type AnyObject    = Record<string, any>
export type StringObject = Record<string, string>

export type KeyOf<T> = Extract<keyof T, string>

export type ObjectOrType<T extends object = object> = T | Type<T>

export const prototypeOf = <T extends object>(target: ObjectOrType<T>): T => isType(target) ? target.prototype : target

export default Type
export type Type<T extends object = object> = new (...args: any[]) => T

export const typeIdentifier = (type: Type) => Symbol.for(type.prototype.constructor.name)

export const typeOf = <T extends object>(target: ObjectOrType<T>): Type<T> => isObject(target)
	? Object.getPrototypeOf(target).constructor
	: target
