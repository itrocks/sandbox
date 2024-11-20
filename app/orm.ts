import ReflectClass from './class/reflect'
import Type         from './class/type'
import Dao          from './dao/dao'
import { storeOf }  from './dao/store'

export function initClass(classType: Type): Type | undefined
{
	try { if (!storeOf(classType)) return }
	catch { return }

	const finalClass = class extends classType {
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

	const properties = [] as string[]
	for (const property of Object.values(new ReflectClass(classType).properties)) {
		const type = property.type
		if (!type || ((typeof type)[0] !== 'f') || (type.toString()[0] !== 'c')) continue
		properties.push(property.name)
		Object.defineProperty(finalClass.prototype, property.name, {
			configurable: true,
			enumerable:   true,
			async get() {
				const property_id = property.name + '_id'
				const value = this[property_id] ? await Dao.read(type as Type, this[property_id]) : undefined
				delete this[property_id]
				Object.defineProperty(this, property.name, { configurable: true, enumerable: true, value, writable: true })
				return value
			},
			set(value) {
				Object.defineProperty(this, property.name, { configurable: true, enumerable: true, value, writable: true })
			},
		})
	}

	return properties.length ? finalClass : undefined
}
