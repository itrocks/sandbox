import { routeOf }                  from '../action/route'
import { decorate, decoratorOf }    from '../decorator/class'
import { dao, HasEntity }           from '../dao/dao'
import { Identifier, MayEntity }    from '../dao/dao'
import tr                           from '../locale/translate'
import { EDIT, HTML, IGNORE }       from '../property/filter/filter'
import { INPUT, OUTPUT, SAVE, SQL } from '../property/filter/filter'
import { Filter, HtmlContainer }    from '../property/filter/filter'
import { setPropertyTypeFilter }    from '../property/filter/filter'
import ReflectProperty              from '../property/reflect'
import { CollectionType }           from '../property/type'
import { representativeValueOf }    from '../view/class/representative'
import { displayOf }                from '../view/property/display'
import { AnyObject, KeyOf }         from './type'
import { ObjectOrType, Type }       from './type'

const COLLECTION = Symbol('collection')

export const Collection = (value = true) => decorate(COLLECTION, value)
export default Collection

export const collectionOf = (target: ObjectOrType) => decoratorOf(target, COLLECTION, false)

Collection(true)(Array)
Collection(true)(Set)

const areMayEntityEntries = (entries: [string, MayEntity | string][]): entries is [string, MayEntity][] =>
	(typeof entries[0]?.[1])[0] === 'o'

const collectionEdit: Filter = <T extends object>(values: MayEntity[], object: T, property: KeyOf<T>) =>
{
	const propertyType = new ReflectProperty(object, property).collectionType
	const fetch        = routeOf(propertyType?.elementType as Type) + '/summary'
	const label        = `<label for="${property}">${tr(displayOf(object, property))}</label>`
	const inputs       = []
	for (const object of values) {
		const attrValue = `value="${representativeValueOf(object)}"`
		inputs.push('<li>' + (
			dao.isObjectConnected(object)
			? `<input id="${property}.${object.id}" name="${property}.${object.id}" ${attrValue}>`
			: `<input id="${property}." name="${property}." ${attrValue}>`
		) + '</li>')
	}
	return label + `<ul data-multiple-contained-auto-width data-fetch="${fetch}" data-type="objects">`
		+ inputs.join('')
		+ `<li><input id="${property}" name="${property}" placeholder="+"></li>`
		+ '</ul>'
}

const collectionInput: Filter = <T extends AnyObject>(
	values: Record<string, MayEntity | string>, object: T, property: KeyOf<T>
) => {
	const entries = Object.entries(values)
	if (areMayEntityEntries(entries)) {
		Object.assign(object, { [property]: entries.map(([id, value]) => dao.connectObject(value, +id)) })
	}
	else {
		delete object[property]
		Object.assign(object, { [property + '_ids']: Object.keys(values).map(id => +id) })
	}
	return IGNORE
}

const collectionOutput: Filter = (values: MayEntity[], _object, _property, askFor: HtmlContainer) =>
{
	if (askFor?.container) {
		askFor.container = false
		return '<ul>' + values.map(object => '<li>' + representativeValueOf(object) + '</li>').join('') + '</ul>'
	}
	return values.map(object => representativeValueOf(object)).join(', ')
}

const collectionSave: Filter = async <T extends AnyObject>(
	values: MayEntity[] | undefined, object: T, property: KeyOf<T>
) => {
	const newIdsPromise: Identifier[] = object[property + '_ids']
		?? values?.map(async value => (dao.isObjectConnected(value) ? value : await dao.save(value)).id).sort()
		?? []
	const previousIdsPromise = dao.isObjectConnected(object)
		? await dao.readCollectionIds<T, MayEntity>(object, property)
		: []
	return async (object: HasEntity<T>) => {
		const previousIds = await Promise.all(previousIdsPromise)
		const newIds      = await Promise.all(newIdsPromise)
		for (const id of previousIds) {
			if (newIds.includes(id)) continue
			dao.deleteLink(object, property, id)
		}
		for (const id of newIds) {
			if (previousIds.includes(id)) continue
			dao.insertLink(object, property, id)
		}
	}
}

setPropertyTypeFilter(CollectionType, HTML, EDIT,   collectionEdit)
setPropertyTypeFilter(CollectionType, HTML, INPUT,  collectionInput)
setPropertyTypeFilter(CollectionType, HTML, OUTPUT, collectionOutput)
setPropertyTypeFilter(CollectionType, SQL,  SAVE,   collectionSave)
