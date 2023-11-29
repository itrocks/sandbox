
const objectOf = (target: object|Type): object => (typeof target === 'object')
	? target
	: new target

type Type = new(...args:any[])=>object

const typeOf = (target: object|Type): Type => (typeof target === 'object')
	? Object.getPrototypeOf(target).constructor
	: target

export default Type
export { objectOf, Type, typeOf }
