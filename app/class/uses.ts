import { decorate, decoratorOf } from '../decorator/class'
import Type                      from './type'

export function Super<T extends object>(self: object): T
{
	return Object.getPrototypeOf(Object.getPrototypeOf(self)) as T
}

/*
export function Super<T extends object>(): T
{
	// this does not work because of strict mode "use strict":
	return Super.caller as T
	// this does not work because of strict mode "use strict":
	return require('caller').default() as T
}
*/

export function uses<T extends Type>(target: T, mixins: Type[]): T
{
	const builtClass = class extends target {
		[index: string]: any
		constructor(...args: any[]) {
			super(...args)
			mixins.forEach(mixin => this[mixin.name]())
		}
	}

	mixins.forEach(mixin => {
		const already = ['constructor']
		let   proto   = mixin.prototype
		while (proto.constructor !== Object) {
			Object.entries(Object.getOwnPropertyDescriptors(proto)).forEach(([name, descriptor]) => {
				if (already.includes(name)) return
				already.push(name)
				Object.defineProperty(builtClass.prototype, name, descriptor)
			})
			proto = Object.getPrototypeOf(proto)
		}
	})

	mixins.forEach(mixin => {
		Object.defineProperty(builtClass.prototype, mixin.name, {
			value: function() {
				Object.entries(new mixin).forEach(([name, value]: [string, any]) => this[name] = value)
			}
		})
	})

	return builtClass
}

const USES = Symbol('uses')

export const Uses = (...mixins: Type[]) => <T extends Type>(target: T): T =>
{
	decorate(USES, mixins)(target)
	return uses(target, mixins)
}
export default Uses

export const usesOf = (target: object | Type) => decoratorOf<Type[]>(target, USES, [])
