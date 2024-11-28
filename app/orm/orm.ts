import ReflectClass       from '../class/reflect'
import { isAnyType }      from '../class/type'
import { KeyOf, Type }    from '../class/type'
import Dao                from '../dao/dao'
import { storeOf }        from '../dao/store'
import ReflectProperty    from '../property/reflect'
import { CollectionType } from '../property/type'

function defineCollectionProperty<T extends object>(type: CollectionType<T>, property: KeyOf<T>, builtClass: Type<T>)
{
	Object.defineProperty(builtClass.prototype, property, {
		configurable: true,
		enumerable:   true,

		async get() {
			return this[property] = await Dao.readCollection(this, property, type.elementType as Type)
		},

		set(value) {
			Object.defineProperty(this, property, { configurable: true, enumerable: true, value, writable: true })
		}

	})
	return property
}

function defineObjectProperty<T extends object>(type: Type, property: KeyOf<T>, builtClass: Type<T>)
{
	Object.defineProperty(builtClass.prototype, property, {
		configurable: true,
		enumerable:   true,

		async get() {
			const property_id = property + '_id'
			return this[property] = this[property_id] ? await Dao.read(type, this[property_id]) : undefined
		},

		set(value) {
			delete this[property + '_id']
			Object.defineProperty(this, property, { configurable: true, enumerable: true, value, writable: true })
		}

	})
	return property
}

export function initClass<T extends object>(classType: Type<T>): Type<T> | undefined
{
	try { if (!storeOf(classType)) return }
	catch { return }

	const properties = new Array<KeyOf<T>>

	// @ts-ignore TS2415 classType is always a heritable class, not a function.
	const BuiltClass = class extends classType {
		[property: string]: any
		constructor(...args: any) {
			super(...args)
			for (const property of properties) {
				delete this[property]
			}
		}
	} as Type<T>

	for (const property of Object.values(new ReflectClass(classType).properties) as ReflectProperty<T>[]) {
		const type = property.type
		if (!type) continue

		if ((type instanceof CollectionType) && isAnyType(type.elementType))
			properties.push(defineCollectionProperty(type, property.name, BuiltClass))
		else if (isAnyType(type))
			properties.push(defineObjectProperty(type, property.name, BuiltClass))
	}

	return properties.length ? BuiltClass : undefined
}
