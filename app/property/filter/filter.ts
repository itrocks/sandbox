import { objectOf, Type }        from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'
import tr                        from '../../locale/translate'
import { displayOf }             from '../../view/property/display'

const FILTERS = Symbol('filters')

export const EDIT      = 'edit'
export const INPUT     = 'input'
export const OUTPUT    = 'output'
export const UNCHANGED = '¤~!~!~!~!~¤'

export type PrimitiveType = 'bigint' | 'boolean' | 'number' | 'object' | 'string' | 'symbol' | 'undefined'
export type FilterType    = object | PrimitiveType | Type
type Filter               = (value: any, type: FilterType, property: string, format: string, direction: string) => any
type Filters              = Array<{ format?: string, direction?: string, filter: Filter }>
type DirectionFilters     = { [direction: string]: Filter }
type FormatFilters        = { [format:    string]: DirectionFilters }
type PropertyFilters      = { [property:  string]: FormatFilters }

// get(type:FilterType)[property:string][format:string][direction:string]: Filter
const filters = new Map<FilterType, PropertyFilters>()

const tab = '\n\t\t\t\t'

export function applyFilter(value: any, type: FilterType, property: string, format: string, direction: string): any
{
	const filter = getFilter(type, property, format, direction)
	if (filter) {
		return filter(value, type, property, format, direction)
	}
	if ((direction === 'edit') && (format === 'html') && !(typeof type === 'string')) {
		const label      = `<label for="${property}">` + tr(displayOf(type, property)) + '</label>'
		const name       = `id="${property}" name="${property}"`
		const inputValue = value ? ` value="${value}"` : ''
		const input      = `<input ${name}${inputValue}>`
		return label + tab + input
	}
	return value
}

export { Filter }

export function getFilter(type: FilterType, property: string, format: string, direction: string): Filter | undefined
{
	const formatFilters = (typeof type === 'string')
		? filters.get(type)?.[property]
		: decoratorOf(type, property, FILTERS, undefined)
	if (!formatFilters) return undefined
	const directionFilters = formatFilters[format] ?? formatFilters['']
	if (!directionFilters) return undefined
	return directionFilters[direction] ?? directionFilters['']
}

export function setFilter(type: FilterType, property: string, format: string, direction: string, filter: Filter)
{
	let propertyFilters
	if (typeof type === 'string') {
		let typeFilters = filters.get(type)
		if (!typeFilters) filters.set(type, typeFilters = {} as PropertyFilters)
		propertyFilters = typeFilters[property] ?? (typeFilters[property] = {})
	}
	else {
		propertyFilters = decoratorOf(type, property, FILTERS, undefined)
		if (!propertyFilters) decorate(FILTERS, propertyFilters = {} as PropertyFilters)(objectOf(type), property)
	}
	let formatFilters = propertyFilters[format] ?? (propertyFilters[format] = {})
	formatFilters[direction] = filter
}

export function setFilters(type: FilterType, property: string, filters: Filters)
{
	for (const filter of filters) {
		setFilter(type, property, filter.format ?? '', filter.direction ?? '', filter.filter)
	}
}
