import { PropertyTypes }      from '@itrocks/property-type'
import { ReflectClass as RC } from '@itrocks/reflect'
import { usesOf }             from '../class/uses'
import { ReflectProperty }    from './property'

export { ReflectClass }
export default class ReflectClass<T extends object = object> extends RC<T>
{

	inheritedPropertyTypes(propertyTypes: PropertyTypes<T>): void
	{
		super.inheritedPropertyTypes(propertyTypes)
		for (const uses of this.uses) {
			Object.assign(propertyTypes, new ReflectClass(uses).propertyTypes)
		}
	}

	get parent()
	{
		const parent = super.parent
		return parent
			? Object.setPrototypeOf(parent, ReflectClass.prototype)
			: parent
	}

	get properties()
	{
		const properties = super.properties
		for (const reflectProperty of Object.values(properties) as ReflectProperty<T>[]) {
			Object.setPrototypeOf(reflectProperty, ReflectProperty.prototype)
		}
		return properties
	}

	get uses()
	{
		const value = usesOf(this.type)
		Object.defineProperty(this, 'uses', { value })
		return value
	}

}
