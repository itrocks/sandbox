import { objectOf }        from '../../class/type'
import { ObjectOrType }    from '../../class/type'
import Type                from '../../class/type'
import { DecoratorOfType } from '../../decorator/class'
import { decorate }        from '../../decorator/property'
import { decoratorOf }     from '../../decorator/property'
import ReflectProperty     from '../reflect'
import { PrimitiveType }   from '../types'

const FILTERS = Symbol('filters')

export const ALL    = null
export const EDIT   = 'edit'
export const INPUT  = 'input'
export const OUTPUT = 'output'
export const READ   = 'read'
export const SAVE   = 'save'

export const HTML = 'html'
export const JSON = 'json'
export const SQL  = 'sql'

export const UNCHANGED = '¤~!~!~!~!~¤'

type Direction      = '' | 'edit' | 'input' | 'output' | 'read' | 'save'
type FilterType     = ObjectOrType | null
type PropertyFilter = DecoratorOfType | PrimitiveType | Type | null

export type Filter = (value: any, target: object, property: string, format: string, direction: Direction) => any
type Filters = Array<{ format?: string, direction?: Direction, filter: Filter }>

type DirectionFilters = { [direction: string]: Filter }
type FormatFilters    = { [format:    string]: DirectionFilters }

const filters = new Map<PropertyFilter, FormatFilters>()

export function applyFilter(value: any, target: object, property: string, format: string, direction: Direction)
{
	let filter = getFilter(target, property, format, direction)
	if (filter) {
		return filter(value, target, property, format, direction)
	}
	const propertyType = new ReflectProperty(target, property).type
	filter = getFilter(null, propertyType, format, direction)
		|| getFilter(null, null, format, direction)
		|| (value => value)
	setFilter(target, property, format, direction, filter)
	return filter(value, target, property, format, direction)
}

function getFilter<T extends FilterType>(
	type: T, property: T extends Type ? string : PrimitiveType | Type | null, format: string, direction: string
) {
	const formatFilters = type
		? decoratorOf(type, property as string, FILTERS, null)
		: filters.get(property as Type)
	if (!formatFilters) return
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return
	return directionFilters[direction] ?? directionFilters['']
}

export function setFilter<T extends FilterType>(
	type:      T,
	property:  T extends Type ? string : PropertyFilter,
	format:    string,
	direction: string,
	filter:    Filter
) {
	let propertyFilters: FormatFilters | undefined
	if (type) {
		propertyFilters = decoratorOf(type, property as string, FILTERS, undefined)
		if (!propertyFilters) {
			decorate(FILTERS, propertyFilters = {})(objectOf(type), property as string)
		}
	}
	else {
		propertyFilters = filters.get(property as PropertyFilter)
		if (!propertyFilters) {
			filters.set(property as Type, propertyFilters = {})
		}
	}
	let formatFilters = propertyFilters[format] ?? (propertyFilters[format] = {})
	formatFilters[direction] = filter
}

export function setFilters<T extends FilterType>(
	type:     T,
	property: T extends Type ? string : PropertyFilter,
	filters:  Filters
) {
	for (const filter of filters) {
		setFilter(type, property, filter.format ?? '', filter.direction ?? '', filter.filter)
	}
}
