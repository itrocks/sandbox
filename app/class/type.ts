
export const isClass    = (value: Function) => value.toString()[0] === 'c'
export const isFunction = (value: Function) => { const c = value.toString()[0]; return (c === 'f') || (c === '(') }

export const isGetter   = (value: any) => value.toString()[0] === 'g'
export const isSetter   = (value: any) => value.toString()[0] === 's'

export const isObject = <T extends object>(target: ObjectOrType<T>): target is T       => (typeof target)[0] === 'o'
export const isType   = <T extends object>(target: ObjectOrType<T>): target is Type<T> => (typeof target)[0] !== 'o'

export type AnyObject = { [property: string]: any }
export type Object    = { [property: string]: any }

export const objectOf = <T extends object>(target: ObjectOrType<T>): T => isType(target)
	? new target
	: target

export type ObjectOrType<T extends object = object> = T | Type<T>

export type Type<T extends object = object> = new(...args: any[]) => T
export default Type

export const typeOf = <T extends object>(target: ObjectOrType<T>): Type<T> => isObject(target)
	? Object.getPrototypeOf(target).constructor
	: target
