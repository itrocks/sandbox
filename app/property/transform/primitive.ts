import { KeyOf, ObjectOrType }         from '@itrocks/class-type'
import { setPropertyTypeTransformers } from '@itrocks/transformer'
import { EDIT, HTML, INPUT, OUTPUT }   from '@itrocks/transformer'
import { READ, SAVE, SQL }             from '@itrocks/transformer'
import { tr }                          from '@itrocks/translate'
import { format, parse }               from 'date-fns'
import { displayOf }                   from '../../view/property/display'

const lfTab = '\n\t\t\t\t'

// Bigint

setPropertyTypeTransformers(BigInt, [
	{ format: HTML, direction: INPUT, transformer: (value: string) => BigInt(value) }
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

setPropertyTypeTransformers(Boolean, [
	{ format: HTML, direction: EDIT,   transformer: booleanEdit },
	{ format: HTML, direction: INPUT,  transformer: booleanInput },
	{ format: HTML, direction: OUTPUT, transformer: (value: boolean) => value ? tr('yes') : tr('no') },
	{ format: SQL,  direction: READ,   transformer: (value: string)  => !!value },
	{ format: SQL,  direction: SAVE,   transformer: (value: boolean) => +value }
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

setPropertyTypeTransformers(Date, [
	{ format: HTML, direction: EDIT,   transformer: dateEdit },
	{ format: HTML, direction: INPUT,  transformer: dateInput },
	{ format: HTML, direction: OUTPUT, transformer: dateOutput }
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

setPropertyTypeTransformers(Number, [
	{ format: HTML, direction: EDIT,  transformer: numberEdit },
	{ format: HTML, direction: INPUT,	transformer: (value: string) => +value }
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

setPropertyTypeTransformers(null, [
	{ format: HTML, direction: EDIT, transformer: defaultEdit }
])
