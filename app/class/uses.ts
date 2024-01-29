import { decorate, decoratorOf } from '../decorator/class'
import Type                      from './type'

function build(type: Type, mixins: Type[])
{
	mixins.forEach(mixin =>
		Object.entries(Object.getOwnPropertyDescriptors(mixin.prototype)).forEach(([name, descriptor]) => {
			if (name === 'constructor') return
			Object.defineProperty(type.prototype, name, descriptor)
		})
	)
	mixins.forEach(mixin =>
		Object.defineProperty(
			type.prototype,
			mixin.name,
			{
				value: function(...args: any[]) {
					Object.entries(new mixin(...args)).forEach(([name, value]: [string, any]) => this[name] = value)
				}
			}
		)
	)
}

const USES = Symbol('uses')

const Uses = (...classes: Type[]) => (target: Type) => {
	build(target, classes)
	return decorate<Type[]>(USES, classes)(target)
}

const usesOf = (target: object|Type) => decoratorOf<Type[]>(target, USES, [])

export { build, Uses, usesOf }

export default Uses
