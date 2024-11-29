import { isAnyObject, KeyOf }     from '../../class/type'
import { objectOf, ObjectOrType } from '../../class/type'
import { Type, typeOf }           from '../../class/type'
import { DecoratorOfType }        from '../../decorator/class'
import { decorate, decoratorOf }  from '../../decorator/property'
import ReflectProperty            from '../reflect'
import { PrimitiveType }          from '../type'

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
	= (value: any, target: ObjectOrType<T>, property: KeyOf<T>, data: any, format: Format, direction: Direction) => any

export class HtmlContainer { constructor(public mandatoryContainer: boolean, public container: boolean = true) {} }

type PropertyType<PT extends object = object> = DecoratorOfType<PT> | PrimitiveType | Type<PT> | null

type DirectionFilters<T extends object = object> = { [direction: Direction]: Filter<T> }
type FormatFilters<T extends object = object>     = { [format: Format]: DirectionFilters<T> }
const filters = new Map<PropertyType, FormatFilters>()

export type FormatFilter = (result: any, data: any) => any
const formatFilters = new Map<string, FormatFilter>

type Filters<T extends object = object> = Array<{ format?: Format, direction?: Direction, filter: Filter<T> }>

export async function applyFilter<T extends object>(
	value: any, target: ObjectOrType<T>, property: KeyOf<T>, format: Format, direction: Direction, data?: any
) {
	let filter = getPropertyFilter<T>(target, property, format, direction)
	if (!filter) {
		const propertyType = new ReflectProperty(target, property).type
		filter = setPropertyFilter<T>(target, property, format, direction,
			(
				getPropertyTypeFilter(propertyType, format, direction)
				|| getPropertyTypeFilter(ALL, format, direction)
				|| ((value: any) => value)
			) as unknown as Filter<T>
		)
	}
	const formatFilter = formatFilters.get(format)
	const result       = filter(value, target, property, data, format, direction)
	return (data && formatFilter) ? formatFilter(result, data) : result
}

function getPropertyFilter<T extends object>(
	target: ObjectOrType<T>, property: KeyOf<T>, format: Format, direction: Direction
) {
	const formatFilters = decoratorOf<FormatFilters<T> | null, T>(target, property, FILTERS, null)
	if (!formatFilters) return
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return
	return directionFilters[direction] ?? directionFilters['']
}

function getPropertyTypeFilter(type: PropertyType, format: Format, direction: Direction)
{
	const formatFilters = filters.get(isAnyObject(type) ? typeOf(type) : type)
	if (!formatFilters) return
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return
	return directionFilters[direction] ?? directionFilters['']
}

export function setFormatFilter(format: string, filter: FormatFilter)
{
	formatFilters.set(format, filter)
}

export function setPropertyFilter<T extends object>(
	type: ObjectOrType<T>, property: KeyOf<T>, format: Format, direction: Direction, filter: Filter<T>
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
