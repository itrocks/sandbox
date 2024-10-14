import ReflectClass      from '../../class/reflect'
import { objectOf }      from '../../class/type'
import Type              from '../../class/type'
import { decorate }      from '../../decorator/property'
import { decoratorOf }   from '../../decorator/property'
import tr                from '../../locale/translate'
import { displayOf }     from '../../view/property/display'
import { PrimitiveType } from '../types'

const FILTERS = Symbol('filters')

export const ALL    = ''
export const EDIT   = 'edit'
export const INPUT  = 'input'
export const OUTPUT = 'output'
export const READ   = 'read'
export const SAVE   = 'save'

export const HTML = 'html'
export const JSON = 'json'
export const SQL  = 'sql'

export const UNCHANGED = '¤~!~!~!~!~¤'

export type Direction      = '' | 'edit' | 'input' | 'output' | 'read' | 'save'
export type FilterType     = TypeType | undefined
export type FilterProperty = string | PropertyType
export type PropertyType   = PrimitiveType | Type
export type TypeType       = object | Type

type Filter  = (value: any, type: TypeType, property: string, format: string, direction: Direction) => any
type Filters = Array<{ format?: string, direction?: Direction, filter: Filter }>

type DirectionFilters = { [direction: string]: Filter }
type FormatFilters    = { [format:    string]: DirectionFilters }
type PropertyFilters  = { [property:  string]: FormatFilters }

const filters = new Map<PropertyType, FormatFilters>()

const lfTab = '\n\t\t\t\t'

export function applyFilter(value: any, type: TypeType, property: string, format: string, direction: Direction): any
{
	let filter = getFilter(type, property, format, direction)
	if (filter) {
		return filter(value, type, property, format, direction)
	}
	let propertyTypeString = new ReflectClass(type).propertyTypes[property] as PropertyType | string
	filter = getFilter(undefined, propertyTypeString as PropertyType, format, direction)
	if (filter) {
		return filter(value, type, property, format, direction)
	}
	if (!((direction === 'edit') && (format === 'html'))) {
		return value
	}
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${value}"` : ''
	const input      = `<input ${name}${inputValue}>`
	return label + lfTab + input
}

export { Filter }

export function getFilter<T extends FilterType>(
	type: T, property: T extends TypeType ? string : PropertyType, format: string, direction: string
): Filter | undefined
{
	let formatFilters: FormatFilters | undefined
	formatFilters = type
		? decoratorOf(type, property as string, FILTERS, undefined)
		: filters.get(property as PropertyType)
	if (!formatFilters) return undefined
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return undefined
	return directionFilters[direction] ?? directionFilters['']
}

export function setFilter<T extends FilterType>(
	type: T, property: T extends TypeType ? string : PropertyType, format: string, direction: string, filter: Filter
) {
	let propertyFilters
	if (type) {
		propertyFilters = decoratorOf(type, property as string, FILTERS, undefined)
		if (!propertyFilters) {
			decorate(FILTERS, propertyFilters = {} as PropertyFilters)(objectOf(type), property as string)
		}
	}
	else {
		propertyFilters = filters.get(property as PropertyType)
		if (!propertyFilters) {
			propertyFilters = {}
			filters.set(property as PropertyType, propertyFilters)
		}
	}
	let formatFilters = propertyFilters[format] ?? (propertyFilters[format] = {})
	formatFilters[direction] = filter
}

export function setFilters<T extends FilterType>(
	type: T, property: T extends (object | Type) ? string : (PrimitiveType | Type), filters: Filters
) {
	for (const filter of filters) {
		setFilter(type, property, filter.format ?? '', filter.direction ?? '', filter.filter)
	}
}
