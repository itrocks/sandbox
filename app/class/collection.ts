import { decorate, decoratorOf } from '../decorator/class'
import { dao, MayEntity }        from '../dao/dao'
import tr                        from '../locale/translate'
import { EDIT, HTML, OUTPUT }    from '../property/filter/filter'
import { Filter, HtmlContainer } from '../property/filter/filter'
import { setPropertyTypeFilter } from '../property/filter/filter'
import { CollectionType }        from '../property/type'
import { representativeValueOf } from '../view/class/representative'
import { displayOf }             from '../view/property/display'
import { KeyOf, ObjectOrType }   from './type'

const COLLECTION = Symbol('collection')

export const Collection = (value = true) => decorate(COLLECTION, value)
export default Collection

export const collectionOf = (target: ObjectOrType) => decoratorOf(target, COLLECTION, false)

Collection(true)(Array)
Collection(true)(Set)

const collectionEdit: Filter = <T extends object>(
	value: MayEntity[], object: T, property: KeyOf<T>
) => {
	const label  = `<label for="${property}">${tr(displayOf(object, property))}</label>`
	const inputs = []
	for (const object of value) {
		inputs.push(dao.isObjectConnected(object)
			? `<input id="${property}.${object.id}" name="${property}.${object.id}" value="${representativeValueOf(object)}">`
			: `<input id="${property}." name="${property}." value="${representativeValueOf(object)}">`
		)
	}
	return label + `<div>${inputs.join('')}<input id="${property}" name="${property}"></div>`
}

const collectionOutput: Filter = (value: MayEntity[], _object, _property, askFor: HtmlContainer) =>
{
	if (askFor?.container) {
		askFor.container = false
		return '<ul>' + value.map(object => '<li>' + representativeValueOf(object) + '</li>').join('') + '</ul>'
	}
	return value.map(object => representativeValueOf(object)).join(', ')
}

setPropertyTypeFilter(CollectionType, HTML, EDIT, collectionEdit)
setPropertyTypeFilter(CollectionType, HTML, OUTPUT, collectionOutput)
