import { AnyObject, KeyOf }           from '@itrocks/class-type'
import { ObjectOrType, Type }         from '@itrocks/class-type'
import { routeOf }                    from '../action/route'
import { decorate, decoratorOf }      from '../decorator/class'
import { dao, HasEntity }             from '../dao/dao'
import { Identifier, MayEntity }      from '../dao/dao'
import tr                             from '../locale/translate'
import { componentOf }                from '../orm/component'
import { compositeOf }                from '../orm/composite'
import { EDIT, HTML, IGNORE }         from '../property/transform/transformer'
import { INPUT, OUTPUT, SAVE, SQL }   from '../property/transform/transformer'
import { HtmlContainer }              from '../property/transform/transformer'
import { setPropertyTypeTransformer } from '../property/transform/transformer'
import { Transformer }                from '../property/transform/transformer'
import ReflectProperty                from '../property/reflect'
import { CollectionType }             from '../property/type'
import { representativeValueOf }      from '../view/class/representative'
import { displayOf }                  from '../view/property/display'
import ReflectClass                   from './reflect'

const COLLECTION = Symbol('collection')

export const Collection = (value = true) => decorate(COLLECTION, value)
export default Collection

export const collectionOf = (target: ObjectOrType) => decoratorOf(target, COLLECTION, false)

Collection(true)(Array)
Collection(true)(Set)

const areMayEntityEntries = (entries: [string, MayEntity | string][]): entries is [string, MayEntity][] =>
	(typeof entries[0]?.[1])[0] === 'o'

const collectionEdit: Transformer = <T extends object>(values: MayEntity[], object: T, property: KeyOf<T>) =>
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

const collectionInput: Transformer = <T extends AnyObject>(
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

const collectionOutput: Transformer = async <T extends object, PT extends object>(
	values: MayEntity<PT>[], object: T, property: KeyOf<T>, askFor: HtmlContainer
) => {
	if (!values.length) {
		return ''
	}
	if (componentOf(object, property)) {
		const propertyType = new ReflectProperty(object, property).type
		if (propertyType instanceof CollectionType) {
			const type          = propertyType.elementType
			const propertyClass = new ReflectClass(type)
			const properties    = propertyClass.propertyNames.filter(property => !compositeOf(type, property)) as KeyOf<PT>[]
			const html = []
			html.push('<table>')
			html.push('<tr>' + properties.map(property => '<th>' + tr(property) + '</th>').join('') + '</tr>')
			html.push(...values.map(
				value => '<tr>' + properties.map(property => '<td>' + value[property] + '</td>').join('') + '</tr>'
			))
			html.push('</table>')
			return html.join('\n')
		}
	}
	if (askFor?.container) {
		askFor.container = false
		return '<ul>' + values.map(object => '<li>' + representativeValueOf(object) + '</li>').join('') + '</ul>'
	}
	return values.map(object => representativeValueOf(object)).join(', ')
}

const collectionSave: Transformer = async <T extends AnyObject>(
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

setPropertyTypeTransformer(CollectionType, HTML, EDIT,   collectionEdit)
setPropertyTypeTransformer(CollectionType, HTML, INPUT,  collectionInput)
setPropertyTypeTransformer(CollectionType, HTML, OUTPUT, collectionOutput)
setPropertyTypeTransformer(CollectionType, SQL,  SAVE,   collectionSave)
