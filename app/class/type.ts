
export const objectOf = <T extends object>(target: T | Type<T>): T => (typeof target === 'object')
	? target
	: new target as T

export type Type<T extends object = object> = new(...args: any[]) => T
export default Type

export const typeOf = <T extends object>(target: T | Type<T>): Type<T> => (typeof target === 'object')
	? Object.getPrototypeOf(target).constructor
	: target
