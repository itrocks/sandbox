import { toColumn }                      from '@itrocks/rename'
import { routeOf }                       from '../action/route'
import { AnyObject, baseType, KeyOf }    from '../class/type'
import { ObjectOrType, StringObject }    from '../class/type'
import Type                              from '../class/type'
import { decorateCallback, decoratorOf } from '../decorator/class'
import tr                                from '../locale/translate'
import { Filter, setPropertyTypeFilter } from '../property/filter/filter'
import { EDIT, HTML, IGNORE }            from '../property/filter/filter'
import { INPUT, OUTPUT, SAVE, SQL }      from '../property/filter/filter'
import ReflectProperty                   from '../property/reflect'
import { representativeValueOf }         from '../view/class/representative'
import { displayOf }                     from '../view/property/display'
import { dao, HasEntity, MayEntity }     from './dao'

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

const storeInput: Filter = <T extends AnyObject>(
	value: MayEntity | undefined, object: T, property: KeyOf<T>, data: StringObject
) => {
	const property_id = property + '_id'
	if (
		(property_id in data)
		&& (
			(property_id in object)
				? (data[property_id] !== object[property_id] + '')
				: (data[property_id] !== (value as HasEntity | undefined)?.id + '')
		)
	) {
		delete object[property]
		Object.assign(object, { [property_id]: +data[property_id] })
	}
	return IGNORE
}

const storeOutput: Filter = (value: MayEntity | undefined) => value ? representativeValueOf(value) : ''

const storeSave: Filter = async <T extends AnyObject>(
	value: MayEntity | undefined, _object: T, property: KeyOf<T>, saveValues: AnyObject
) => {
	if (value && !dao.isObjectConnected(value)) {
		await dao.save(value)
	}
	const property_id       = property + '_id'
	const id                = (value && dao.isObjectConnected(value)) ? value.id : saveValues[property_id]
	saveValues[property_id] = id ?? null
	return IGNORE
}

export const Store = (name: string | false = '') => decorateCallback(STORE, target =>
{
	if (name !== false) {
		setPropertyTypeFilter(target, HTML, EDIT,   storeEdit)
		setPropertyTypeFilter(target, HTML, INPUT,  storeInput)
		setPropertyTypeFilter(target, HTML, OUTPUT, storeOutput)
		setPropertyTypeFilter(target, SQL,  SAVE,   storeSave)
	}
	if (name !== '') {
		return name
	}
	return toColumn(baseType(target).name)
})
export default Store

export const storeOf = (target: ObjectOrType) => decoratorOf<string | false>(target, STORE, false)
