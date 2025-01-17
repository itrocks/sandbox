import { AnyObject, baseType, KeyOf }    from '@itrocks/class-type'
import { ObjectOrType, StringObject }    from '@itrocks/class-type'
import { Type }                          from '@itrocks/class-type'
import { decorateCallback, decoratorOf } from '@itrocks/decorator/class'
import { ReflectProperty }               from '@itrocks/reflect'
import { toColumn }                      from '@itrocks/rename'
import { dataSource, Entity, MayEntity } from '@itrocks/storage'
import { routeOf }                       from '../action/route'
import { tr }                            from '../locale/translate'
import { setPropertyTypeTransformer }    from '../property/transform/transformer'
import { EDIT, HTML, IGNORE }            from '../property/transform/transformer'
import { INPUT, OUTPUT, SAVE, SQL }      from '../property/transform/transformer'
import { representativeValueOf }         from '../view/class/representative'
import { displayOf }                     from '../view/property/display'

const lfTab = '\n\t\t\t\t'

const STORE = Symbol('store')

function storeEdit<T extends object>(value: Entity | undefined, object: T, property: KeyOf<T>)
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

function storeInput<T extends AnyObject>(
	value: MayEntity | undefined, object: T, property: KeyOf<T>, data: StringObject
) {
	const property_id = property + '_id'
	if (
		(property_id in data)
		&& (
			(property_id in object)
				? (data[property_id] !== object[property_id] + '')
				: (data[property_id] !== (value as Entity | undefined)?.id + '')
		)
	) {
		delete object[property]
		Object.assign(object, { [property_id]: +data[property_id] })
	}
	return IGNORE
}

function storeOutput(value: MayEntity | undefined)
{
	return value ? representativeValueOf(value) : ''
}

async function storeSave<T extends AnyObject>(
	value: MayEntity | undefined, _object: T, property: KeyOf<T>, saveValues: AnyObject
) {
	const dao = dataSource()
	if (value && !dao.isObjectConnected(value)) {
		await dao.save(value)
	}
	const property_id       = property + '_id'
	const id                = (value && dao.isObjectConnected(value)) ? value.id : saveValues[property_id]
	saveValues[property_id] = id ?? null
	return IGNORE
}

export default Store
export function Store(name: string | false = '')
{
	return decorateCallback(STORE, function(target) {
		if (name !== false) {
			setPropertyTypeTransformer(target, HTML, EDIT,   storeEdit)
			setPropertyTypeTransformer(target, HTML, INPUT,  storeInput)
			setPropertyTypeTransformer(target, HTML, OUTPUT, storeOutput)
			setPropertyTypeTransformer(target, SQL,  SAVE,   storeSave)
		}
		if (name !== '') {
			return name
		}
		return toColumn(baseType(target).name)
	})
}

export function storeOf(target: ObjectOrType)
{
	return decoratorOf<string | false>(target, STORE, false)
}
