import { routeOf }                       from '../action/route'
import { ObjectOrType, Type }            from '../class/type'
import { decorateCallback, decoratorOf } from '../decorator/class'
import tr                                from '../locale/translate'
import { EDIT, HTML, setFilter }         from '../property/filter/filter'
import ReflectProperty                   from '../property/reflect'
import { displayOf }                     from '../view/property/display'
import { Entity }                        from './dao'
import {representativeValueOf} from '../view/class/representative'

const lfTab = '\n\t\t\t\t'

const STORE = Symbol('store')

function storeOutput(value: object & Entity | undefined, type: ObjectOrType, property: string)
{
	const propertyType   = new ReflectProperty(type, property).type as Type
	const representative = value ? representativeValueOf(value) : ''
	const fetch          = routeOf(propertyType) + '/summary'
	const label          = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name           = `id="${property}" name="${property}"`
	const inputValue     = representative.length ? ` value="${representative}"` : ''
	const input          = `<input data-fetch="${fetch}" data-type="object" ${name}${inputValue}>`
	const input_id       = `<input id="${property}_id" name="${property}_id" type="hidden" value="${value?.id}">`
	return label + lfTab + input + input_id
}

export const Store = (name: false | string = '') => decorateCallback(STORE, target =>
{
	if (name !== false) {
		setFilter(null, target, HTML, EDIT, storeOutput)
	}
	return (name === '') ? target.name.toLowerCase() : name
})
export default Store

export const storeOf = (target: ObjectOrType) => decoratorOf<false | string>(target, STORE, false)
