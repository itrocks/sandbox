import ReflectClass    from './class/reflect'
import Type            from './class/type'
import Dao             from './dao/dao'
import { storeOf }     from './dao/store'
import ReflectProperty from './property/reflect'

export function initClass(classType: Type): Type | undefined
{
	try { if (!storeOf(classType)) return }
	catch { return }

	const BuiltClass = class extends classType {
		[property: string]: any
		constructor(...args: any) {
			super(...args)
			for (const property of properties) {
				if (!this[property]) {
					delete this[property]
				}
			}
		}
	}

	const properties = new Array<string>
	for (const property of Object.values(new ReflectClass(classType).properties) as ReflectProperty<object>[]) {
		const type = property.type as Type
		if (!type || ((typeof type)[0] !== 'f') || (type.toString()[0] !== 'c')) continue

		properties.push(property.name)
		Object.defineProperty(BuiltClass.prototype, property.name, {
			configurable: true,
			enumerable:   true,

			async get() {
				const property_id = property.name + '_id'
				return this[property.name] = this[property_id] ? await Dao.read(type, this[property_id]) : undefined
			},

			set(value) {
				delete this[property.name + '_id']
				Object.defineProperty(this, property.name, { configurable: true, enumerable: true, value, writable: true })
			},

		})
	}

	return properties.length ? BuiltClass : undefined
}
