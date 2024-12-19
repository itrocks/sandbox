import { baseType }              from '@itrocks/class-type'
import { ObjectOrType, Type }    from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/class'

export function Super<T extends object>(self: object): T
{
	return Object.getPrototypeOf(Object.getPrototypeOf(self))
}

function uses<T extends Type>(target: T, mixins: Type[]): T
{
	const BuiltClass = (() => class extends target {
		[index: string]: any
		constructor(...args: any[]) {
			super(...args)
			for (const mixin of mixins) this[mixin.name]()
		}
	})()

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

export default Uses
export function Uses<T extends object>(...mixins: Type[])
{
	return (target: Type<T>) => {
		decorate<T>(USES, mixins.concat(usesOf(target)))(target)
		return uses(target, mixins)
	}
}

export function usesOf(target: ObjectOrType, resolveBuiltClass = false)
{
	const usesOf = decoratorOf<Type[]>(target, USES, [])
	return resolveBuiltClass
		? usesOf.map(type => baseType(type))
		: usesOf
}
