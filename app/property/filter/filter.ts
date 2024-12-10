import { isAnyObject, KeyOf } from '../../class/type'
import { ObjectOrType }       from '../../class/type'
import { prototypeOf }        from '../../class/type'
import { typeOf, Type }       from '../../class/type'
import { DecoratorOfType }    from '../../decorator/class'
import ReflectProperty        from '../reflect'
import { PrimitiveType }      from '../type'

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

export const IGNORE = '¤~!~!~!~!~¤'

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

type Filters<T extends object = object> = { format?: Format, direction?: Direction, filter: Filter<T> }[]

export async function applyFilter<T extends object>(
	value: any, target: ObjectOrType<T>, property: KeyOf<T>, format: Format, direction: Direction, data?: any
) {
	const object = prototypeOf(target)
	let   filter = getPropertyFilter<T>(object, property, format, direction)
	if (filter === undefined) {
		const propertyType = new ReflectProperty(target, property).type
		filter = setPropertyFilter(
			object, property, format, direction,
			(
				propertyType
					? (
						getPropertyTypeFilter(propertyType, format, direction)
						|| getPropertyTypeFilter(ALL, format, direction)
						|| false
					)
					: false
			) as unknown as (Filter<T> | false)
		)
	}
	const formatFilter = formatFilters.get(format)
	const result       = filter ? filter(value, target, property, data, format, direction) : value
	return (data && formatFilter) ? formatFilter(result, data) : result
}

function getPropertyFilter<T extends object>(object: T, property: KeyOf<T>, format: Format, direction: Direction)
	: Filter<T> | false | undefined
{
	const formatFilters = Reflect.getMetadata(FILTERS, object, property)
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
	target: ObjectOrType<T>, property: KeyOf<T>, format: Format, direction: Direction, filter: Filter<T> | false
) {
	target = prototypeOf(target)
	let propertyFilters = Reflect.getMetadata(FILTERS, target, property)
	if (!propertyFilters) {
		Reflect.defineMetadata(FILTERS, propertyFilters = {}, target, property)
	}
	let formatFilters = propertyFilters[format] ?? (propertyFilters[format] = {})
	formatFilters[direction] = filter
	return filter
}

export function setPropertyFilters<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>, filters: Filters<T>)
{
	for (const filter of filters) {
		setPropertyFilter(target, property, filter.format ?? '', filter.direction ?? '', filter.filter)
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
