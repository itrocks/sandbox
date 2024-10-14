import { format }     from 'date-fns'
import { parse }      from 'date-fns'
import tr             from '../../locale/translate'
import { displayOf }  from '../../view/property/display'
import { HTML, SQL }  from './filter'
import { setFilter}   from './filter'
import { setFilters } from './filter'
import { TypeType }   from './filter'
import { EDIT, INPUT, OUTPUT, READ, SAVE } from './filter'

setFilter(undefined, 'bigint', 'html', 'input', value => BigInt(value))

const lfTab = '\n\t\t\t\t'

// boolean

function booleanEdit(value: boolean, type: TypeType, property: string): string
{
	const label    = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name     = `id="${property}" name="${property}"`
	const hidden   = `<input name="${property}" type="hidden" value="0">`
	const checked  = value ? 'checked ' : ''
	const checkbox = `<input ${checked}${name} type="checkbox" value="1">`
	return label + lfTab + hidden + lfTab + checkbox
}

const booleanInput = (value: string) => !['', '0', 'false', 'no', tr('false'), tr('no')].includes(value)

setFilters(undefined, 'boolean', [
	{ format: HTML, direction: EDIT,   filter: booleanEdit },
	{ format: HTML, direction: INPUT,  filter: booleanInput },
	{ format: HTML, direction: OUTPUT, filter: value => value ? tr('yes') : tr('no') }
])

// number

function numberEdit(value: number, type: TypeType, property: string): string
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${value}"` : ''
	const input      = `<input data-number ${name}${inputValue}>`
	return label + lfTab + input
}

setFilters(undefined, 'number', [
	{ format: HTML, direction: EDIT,  filter: numberEdit },
	{ format: HTML, direction: INPUT,	filter: (value: string) => Number(value) }
])

// Date

function dateEdit(value: Date, type: TypeType, property: string): string
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${format(value, tr('dd/MM/yyyy', { ucFirst: false }))}"` : ''
	const input      = `<input data-date ${name}${inputValue}>`
	return label + lfTab + input
}

const dateInput  = (value: string) => parse(value, tr('dd/MM/yyyy', { ucFirst: false }), new Date)
const dateOutput = (value: Date)   => value ? format(value, tr('dd/MM/yyyy', { ucFirst: false })) : ''

setFilters(undefined, Date, [
	{ format: HTML, direction: EDIT,   filter: dateEdit },
	{ format: HTML, direction: INPUT,  filter: dateInput },
	{ format: HTML, direction: OUTPUT, filter: dateOutput },
	{ format: SQL,  direction: READ,   filter: value => new Date(value) },
	{ format: SQL,  direction: SAVE,   filter: value => format(value, 'yyyy-MM-dd') }
])
