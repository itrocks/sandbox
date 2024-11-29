import { routeOf }                        from '../action/route'
import { AnyObject, KeyOf, ObjectOrType } from '../class/type'
import { StringObject, Type }             from '../class/type'
import { decorateCallback, decoratorOf }  from '../decorator/class'
import tr                                 from '../locale/translate'
import { Filter, setPropertyTypeFilter }  from '../property/filter/filter'
import { EDIT, HTML, INPUT, OUTPUT }      from '../property/filter/filter'
import { SAVE, SQL, UNCHANGED }           from '../property/filter/filter'
import ReflectProperty                    from '../property/reflect'
import { representativeValueOf }          from '../view/class/representative'
import { displayOf }                      from '../view/property/display'
import { dao, HasEntity, MayEntity }      from './dao'

const lfTab = '\n\t\t\t\t'

const STORE = Symbol('store')

function storeEdit<T extends object>(value: HasEntity | undefined, object: T, property: KeyOf<T>)
{
	const propertyType   = new ReflectProperty(object, property).type as Type
	const representative = value ? representativeValueOf(value) : ''
	const fetch          = routeOf(propertyType) + '/summary'
	const label          = `<label for="${property}">${tr(displayOf(object, property))}</label>`
	const name           = `id="${property}" name="${property}"`
	const inputValue     = representative.length ? ` value="${representative}"` : ''
	const input          = `<input data-fetch="${fetch}" data-type="object" ${name}${inputValue}>`
	const input_id       = `<input id="${property}_id" name="${property}_id" type="hidden" value="${value?.id}">`
	return label + lfTab + input + input_id
}

const storeInput: Filter = <T extends object>(
	value: object | HasEntity | undefined, object: T, property: KeyOf<T>, data: StringObject
) => {
	const property_id = property + '_id'
	if (
		(property_id in data)
		&& ((property_id in object)
			? (data[property_id] !== String((object as AnyObject)[property_id]))
			: (data[property_id] !== String((value as HasEntity | undefined)?.id))
		)
	) {
		delete object[property]
		Object.assign(object, { [property_id]: Number(data[property_id]) })
	}
	return UNCHANGED
}

const storeSave: Filter = <T extends object>(value: MayEntity | undefined, object: T, property: KeyOf<T>) =>
{
	if (value && dao.isObjectConnected(value)) {
		Object.assign(object, { [property + '_id']: value.id })
	}
	return UNCHANGED
}

export const Store = (name: string | false = '') => decorateCallback(STORE, target =>
{
	if (name !== false) {
		setPropertyTypeFilter(target, HTML, EDIT,   storeEdit)
		setPropertyTypeFilter(target, HTML, INPUT,  storeInput)
		setPropertyTypeFilter(target, HTML, OUTPUT, representativeValueOf)
		setPropertyTypeFilter(target, SQL,  SAVE,   storeSave)
	}
	return (name === '') ? target.name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase() : name
})
export default Store

export const storeOf = (target: ObjectOrType) => decoratorOf<string | false>(target, STORE, false)
