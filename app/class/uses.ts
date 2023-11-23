import { decoratorOf } from '../decorator/class'
import Type from './type'

function build(type: Type, mixins: Type[])
{
	mixins.forEach(mixin =>
		Object.getOwnPropertyNames(mixin.prototype).forEach(name => {
			Object.defineProperty(
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

const uses = (...classes: Type[]) => {
	return (target: Type) => {
		build(target, classes)
		Reflect.defineMetadata('mixes', classes, target.prototype)
	}
}

const usesOf = (object: object|Type) => decoratorOf<Type[]>(object, 'mixes', [])

export default uses
export { build, uses, usesOf }
