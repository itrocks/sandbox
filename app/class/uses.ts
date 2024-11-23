import { decorate, decoratorOf } from '../decorator/class'
import { ObjectOrType, Type }    from './type'

export function Super<T extends object>(self: object): T
{
	return Object.getPrototypeOf(Object.getPrototypeOf(self))
}

function uses<T extends Type>(target: T, mixins: Type[]): T
{
	const BuiltClass = class extends target {
		[index: string]: any
		constructor(...args: any[]) {
			super(...args)
			for (const mixin of mixins) this[mixin.name]()
		}
	}

	for (const mixin of mixins) {
		const already = ['constructor']
		let   proto   = mixin.prototype
		while (proto.constructor !== Object) {
			for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
				if (already.includes(name)) continue
				already.push(name)
				Object.defineProperty(BuiltClass.prototype, name, descriptor)
			}
			proto = Object.getPrototypeOf(proto)
		}
	}

	for (const mixin of mixins) {
		Object.defineProperty(BuiltClass.prototype, mixin.name, {
			value: function() {
				for (const [name, value] of Object.entries(new mixin)) this[name] = value
			}
		})
	}

	return BuiltClass
}

const USES = Symbol('uses')

export const Uses = <T extends object>(...mixins: Type[]) => (target: Type<T>) =>
{
	decorate(USES, mixins.concat(usesOf(target)))(target)
	return uses(target, mixins)
}
export default Uses

export const usesOf = (target: ObjectOrType, resolveBuiltClass = false) => {
	const usesOf = decoratorOf<Type[]>(target, USES, [])
	if (!resolveBuiltClass) {
		return usesOf
	}
	for (const x in usesOf) {
		let type = usesOf[x]
		while (type.name === 'BuiltClass') {
			type = usesOf[x] = Object.getPrototypeOf(type)
		}
	}
	return usesOf
}
