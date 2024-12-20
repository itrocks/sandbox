import { isAnyType }      from '@itrocks/class-type'
import { KeyOf, Type }    from '@itrocks/class-type'
import { CollectionType } from '@itrocks/property-type'
import ReflectClass       from '../class/reflect'
import Dao                from '../dao/dao'
import { storeOf }        from '../dao/store'
import ReflectProperty    from '../property/reflect'

export const PROTECT_GET = Symbol('protectGet')

export type PropertyDescriptorWithProtectGet = PropertyDescriptor & ThisType<any> & { [PROTECT_GET]?: true }

function defineCollectionProperty<T extends object>(type: CollectionType<T>, property: KeyOf<T>, builtClass: Type<T>)
{
	const descriptor: PropertyDescriptorWithProtectGet = {
		configurable:  true,
		enumerable:    true,

		async get() {
			const elementType = type.elementType as Type
			const ids         = this[property + '_ids']
			return this[property] = ids
				? await Dao.readMultiple(elementType, ids)
				: await Dao.readCollection(this, property, elementType)
		},

		set(value) {
			delete this[property + '_ids']
			Object.defineProperty(this, property, { configurable: true, enumerable: true, value, writable: true })
			Reflect.deleteMetadata(PROTECT_GET, builtClass.prototype, property)
		}

	}
	Object.defineProperty(builtClass.prototype, property, descriptor)
	Reflect.defineMetadata(PROTECT_GET, true, builtClass.prototype, property)
	return property
}

function defineObjectProperty<T extends object>(type: Type, property: KeyOf<T>, builtClass: Type<T>)
{
	const descriptor: PropertyDescriptorWithProtectGet = {
		configurable: true,
		enumerable:   true,

		async get() {
			const id = this[property + '_id']
			return this[property] = id ? await Dao.read(type, id) : undefined
		},

		set(value) {
			delete this[property + '_id']
			Object.defineProperty(this, property, { configurable: true, enumerable: true, value, writable: true })
			Reflect.deleteMetadata(PROTECT_GET, builtClass.prototype, property)
		}

	}
	Object.defineProperty(builtClass.prototype, property, descriptor)
	Reflect.defineMetadata(PROTECT_GET, true, builtClass.prototype, property)
	return property
}

export function initClass<T extends object>(classType: Type<T>): Type<T> | undefined
{
	try { if (!storeOf(classType)) return }
	catch { return }

	const properties: KeyOf<T>[] = []

	// @ts-ignore TS2415 classType is always a heritable class, not a function.
	const BuiltClass: Type<T> = (() => class extends classType {
		[property: string]: any
		constructor(...args: any) {
			super(...args)
			for (const property of properties) {
				delete this[property]
			}
		}
	})()

	for (const property of Object.values(new ReflectClass(classType).properties) satisfies ReflectProperty<T>[]) {
		const type = property.type
		if (!type) continue

		if ((type instanceof CollectionType) && isAnyType(type.elementType))
			properties.push(defineCollectionProperty(type, property.name, BuiltClass))
		else if (isAnyType(type))
			properties.push(defineObjectProperty(type, property.name, BuiltClass))
	}

	return properties.length ? BuiltClass : undefined
}
