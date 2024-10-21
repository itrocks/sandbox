import { format }       from 'date-fns'
import { parse }        from 'date-fns'
import { ObjectOrType } from '../../class/type'
import tr               from '../../locale/translate'
import { displayOf }    from '../../view/property/display'
import { HTML, SQL }    from './filter'
import { setFilter }    from './filter'
import { setFilters }   from './filter'
import { EDIT, INPUT, OUTPUT, READ, SAVE } from './filter'

const lfTab = '\n\t\t\t\t'

// Bigint

setFilter(null, BigInt, 'html', 'input', (value: string) => BigInt(value))

// Boolean

function booleanEdit(value: boolean, type: ObjectOrType, property: string)
{
	const label    = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name     = `id="${property}" name="${property}"`
	const hidden   = `<input name="${property}" type="hidden" value="0">`
	const checked  = value ? 'checked ' : ''
	const checkbox = `<input ${checked}${name} type="checkbox" value="1">`
	return label + lfTab + hidden + lfTab + checkbox
}

const booleanInput = (value: string) => !['', '0', 'false', 'no', tr('false'), tr('no')].includes(value)

setFilters(null, Boolean, [
	{ format: HTML, direction: EDIT,   filter: booleanEdit },
	{ format: HTML, direction: INPUT,  filter: booleanInput },
	{ format: HTML, direction: OUTPUT, filter: (value: boolean) => value ? tr('yes') : tr('no') }
])

// Date

function dateEdit(value: Date, type: ObjectOrType, property: string)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${format(value, tr('dd/MM/yyyy', { ucFirst: false }))}"` : ''
	const input      = `<input data-date ${name}${inputValue}>`
	return label + lfTab + input
}

const dateInput  = (value: string) => parse(value, tr('dd/MM/yyyy', { ucFirst: false }), new Date)
const dateOutput = (value: Date)   => value ? format(value, tr('dd/MM/yyyy', { ucFirst: false })) : ''

setFilters(null, Date, [
	{ format: HTML, direction: EDIT,   filter: dateEdit },
	{ format: HTML, direction: INPUT,  filter: dateInput },
	{ format: HTML, direction: OUTPUT, filter: dateOutput },
	{ format: SQL,  direction: READ,   filter: (value: string) => new Date(value) },
	{ format: SQL,  direction: SAVE,   filter: (value: Date) => format(value, 'yyyy-MM-dd') }
])

// Number

function numberEdit(value: number, type: ObjectOrType, property: string)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${value}"` : ''
	const input      = `<input data-number ${name}${inputValue}>`
	return label + lfTab + input
}

setFilters(null, Number, [
	{ format: HTML, direction: EDIT,  filter: numberEdit },
	{ format: HTML, direction: INPUT,	filter: (value: string) => Number(value) }
])

// @Store

setFilters(null, Object, [
	{ format: HTML, direction: OUTPUT, filter: (value: object) => value?.toString() },
	//{ format: SQL, direction: READ, filter: (value: bigint) => isClass(typeof value) ? value : new (ty) }
])

// default

function defaultEdit(value: any, type: ObjectOrType, property: string)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${value}"` : ''
	const input      = `<input ${name}${inputValue}>`
	return label + lfTab + input
}

setFilters(null, null, [
	{ format: HTML, direction: EDIT, filter: defaultEdit }
])
