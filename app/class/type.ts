
export const objectOf = (target: object | Type): object => (typeof target === 'object')
	? target
	: new target

export type Type = new(...args: any[]) => object
export default Type

export const typeOf = (target: object | Type): Type => (typeof target === 'object')
	? Object.getPrototypeOf(target).constructor
	: target
