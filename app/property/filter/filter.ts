import { objectOf }        from '../../class/type'
import { KeyOf, Type }     from '../../class/type'
import { DecoratorOfType } from '../../decorator/class'
import { decorate }        from '../../decorator/property'
import { decoratorOf }     from '../../decorator/property'
import ReflectProperty     from '../reflect'
import { PrimitiveType }   from '../type'

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

type Direction = string | '' | 'edit' | 'input' | 'output' | 'read' | 'save'
type Format    = string | '' | 'html' | 'json' | 'sql'

export type Filter<T extends object = object>
	= (value: any, target: T, property: KeyOf<T>, data: any, format: Format, direction: Direction) => any

type PropertyType<PT extends object = object> = DecoratorOfType<PT> | PrimitiveType | Type<PT> | null

type DirectionFilters<T extends object = object> = { [direction: Direction]: Filter<T> }
type FormatFilters<T extends object = object>     = { [format: Format]: DirectionFilters<T> }

const filters = new Map<PropertyType, FormatFilters>()

type Filters<T extends object = object> = Array<{ format?: Format, direction?: Direction, filter: Filter<T> }>

export async function applyFilter<T extends object>(
	value: any, target: T, property: KeyOf<T>, format: Format, direction: Direction, data?: any
) {
	let filter = getPropertyFilter<T>(target, property, format, direction)
	if (!filter) {
		const propertyType = new ReflectProperty(target, property).type
		filter = setPropertyFilter<T>(target, property, format, direction,
			(
				getPropertyTypeFilter(propertyType, format, direction)
				|| getPropertyTypeFilter(null, format, direction)
				|| ((value: any) => value)
			) as unknown as Filter<T>
		)
	}
	return filter(value, target, property, data, format, direction)
}

function getPropertyFilter<T extends object>(target: T, property: KeyOf<T>, format: Format, direction: Direction)
{
	const formatFilters = decoratorOf<FormatFilters<T> | null, T>(target, property, FILTERS, null)
	if (!formatFilters) return
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return
	return directionFilters[direction] ?? directionFilters['']
}

function getPropertyTypeFilter(type: PropertyType, format: Format, direction: Direction)
{
	const formatFilters = filters.get(type)
	if (!formatFilters) return
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return
	return directionFilters[direction] ?? directionFilters['']
}

export function setPropertyFilter<T extends object>(
	type: T, property: KeyOf<T>, format: Format, direction: Direction, filter: Filter<T>
) {
	let propertyFilters = decoratorOf<FormatFilters<T> | null, T>(type, property, FILTERS, null)
	if (!propertyFilters) {
		decorate<T>(FILTERS, propertyFilters = {})(objectOf(type), property)
	}
	let formatFilters = propertyFilters[format] ?? (propertyFilters[format] = {})
	formatFilters[direction] = filter
	return filter
}

export function setPropertyFilters<T extends object>(type: T, property: KeyOf<T>, filters: Filters<T>)
{
	for (const filter of filters) {
		setPropertyFilter(type, property, filter.format ?? '', filter.direction ?? '', filter.filter)
	}
}

export function setPropertyTypeFilter<T extends object>(
	type: PropertyType, format: Format, direction: Direction, filter: Filter<T>
) {
	let propertyFilters = filters.get(type) as unknown as FormatFilters<T>
	if (!propertyFilters) {
		filters.set(type, propertyFilters = {})
	}
	let formatFilters = propertyFilters[format] ?? (propertyFilters[format] = {})
	formatFilters[direction] = filter
}

export function setPropertyTypeFilters<T extends object>(type: PropertyType, filters: Filters<T>)
{
	for (const filter of filters) {
		setPropertyTypeFilter(type, filter.format ?? '', filter.direction ?? '', filter.filter)
	}
}
