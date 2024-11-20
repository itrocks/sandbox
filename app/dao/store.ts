import { ObjectOrType }                  from '../class/type'
import { decorateCallback, decoratorOf } from '../decorator/class'
import tr                                from '../locale/translate'
import { EDIT, HTML, setFilter }         from '../property/filter/filter'
import { displayOf }                     from '../view/property/display'

const lfTab = '\n\t\t\t\t'

const STORE = Symbol('store')

function storeOutput(value: object, type: ObjectOrType, property: string)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${value}"` : ''
	const input      = `<input data-type="object" ${name}${inputValue}>`
	return label + lfTab + input
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
