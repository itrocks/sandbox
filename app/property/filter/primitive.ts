import { format, parse }             from 'date-fns'
import { KeyOf, ObjectOrType }       from '../../class/type'
import tr                            from '../../locale/translate'
import { displayOf }                 from '../../view/property/display'
import { setPropertyTypeFilters }    from './filter'
import { EDIT, HTML, INPUT, OUTPUT } from './filter'
import { READ, SAVE, SQL }           from './filter'

const lfTab = '\n\t\t\t\t'

// Bigint

setPropertyTypeFilters(BigInt, [
	{ format: HTML, direction: INPUT, filter: (value: string) => BigInt(value) }
])

// Boolean

function booleanEdit<T extends object>(value: boolean, type: ObjectOrType<T>, property: KeyOf<T>)
{
	const label    = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name     = `id="${property}" name="${property}"`
	const hidden   = `<input name="${property}" type="hidden" value="0">`
	const checked  = value ? 'checked ' : ''
	const checkbox = `<input ${checked}${name} type="checkbox" value="1">`
	return label + lfTab + hidden + lfTab + checkbox
}

const booleanInput = (value: string) => !['', '0', 'false', 'no', tr('false'), tr('no')].includes(value)

setPropertyTypeFilters(Boolean, [
	{ format: HTML, direction: EDIT,   filter: booleanEdit },
	{ format: HTML, direction: INPUT,  filter: booleanInput },
	{ format: HTML, direction: OUTPUT, filter: (value: boolean) => value ? tr('yes') : tr('no') },
	{ format: SQL,  direction: READ,   filter: (value: string)  => !!value },
	{ format: SQL,  direction: SAVE,   filter: (value: boolean) => +value }
])

// Date

function dateEdit<T extends object>(value: Date, type: ObjectOrType<T>, property: KeyOf<T>)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${format(value, tr('dd/MM/yyyy', { ucFirst: false }))}"` : ''
	const input      = `<input data-type="date" ${name}${inputValue}>`
	return label + lfTab + input
}

const dateInput  = (value: string) => parse(value, tr('dd/MM/yyyy', { ucFirst: false }), new Date)
const dateOutput = (value: Date)   => value ? format(value, tr('dd/MM/yyyy', { ucFirst: false })) : ''

setPropertyTypeFilters(Date, [
	{ format: HTML, direction: EDIT,   filter: dateEdit },
	{ format: HTML, direction: INPUT,  filter: dateInput },
	{ format: HTML, direction: OUTPUT, filter: dateOutput }
])

// Number

function numberEdit<T extends object>(value: number | undefined, type: ObjectOrType<T>, property: KeyOf<T>)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = (value !== undefined) ? ` value="${value}"` : ''
	const input      = `<input data-type="number" ${name}${inputValue}>`
	return label + lfTab + input
}

setPropertyTypeFilters(Number, [
	{ format: HTML, direction: EDIT,  filter: numberEdit },
	{ format: HTML, direction: INPUT,	filter: (value: string) => +value }
])

// default

function defaultEdit<T extends object>(value: any, type: ObjectOrType<T>, property: KeyOf<T>)
{
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const name       = `id="${property}" name="${property}"`
	const inputValue = value ? ` value="${value}"` : ''
	const input      = `<input ${name}${inputValue}>`
	return label + lfTab + input
}

setPropertyTypeFilters(null, [
	{ format: HTML, direction: EDIT, filter: defaultEdit }
])
