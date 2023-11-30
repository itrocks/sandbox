import { decoratorOf } from '../decorator/class'
import Type from './type'

function build(type: Type, mixins: Type[])
{
	mixins.forEach(mixin =>
		Object.getOwnPropertyNames(mixin.prototype).forEach(name => {
			(name !== 'constructor')
			&& Object.defineProperty(
				type.prototype,
				name,
				Object.getOwnPropertyDescriptor(mixin.prototype, name) || Object.create(null)
			)
		})
	)
	mixins.forEach(mixin =>
		Object.defineProperty(
			type.prototype,
			mixin.name,
			{
				value: function(...args:any[]) {
					Object.entries(new mixin(...args)).forEach(([name, value]: [string, any]) => this[name] = value)
				}
			}
		)
	)
}

const Uses = (...classes: Type[]) => {
	return (target: Type) => {
		build(target, classes)
		Reflect.defineMetadata('mixes', classes, target.prototype)
	}
}

const usesOf = (target: object|Type) => decoratorOf<Type[]>(target, 'mixes', [])

export default Uses
export { build, Uses, usesOf }
