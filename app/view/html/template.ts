import { readFile }                       from 'node:fs/promises'
import { properties }                     from '../../class/reflect'
import { tr }                             from '../../locale/translate'
import ReflectProperty                    from '../../property/reflect'
import { displayOf as classDisplayOf }    from '../class/display'
import { outputOf }                       from '../class/output'
import { displayOf as propertyDisplayOf } from '../property/display'
import Str                                from '../str'

type BlockStack = Array<{ blockStart: number, collection: any[], data: any, iteration: number, iterations: number }>

let index:  number
let length: number
let source: string
let start:  number
let target: string
let text:   string

let translateCount           = 0
let translateParts: string[] = []
let translating              = false

export default class Template
{
	doExpression = true

	onAttribute?: ((name: string, value: string) => void)
	onTagOpen?:   ((name: string) => void)
	onTagOpened?: ((name: string) => void)
	onTagClose?:  ((name: string) => void)
	onText?:      ((text: string) => void)

	translateAttributes = ['alt', 'enterkeyhint', 'label', 'placeholder', 'srcdoc', 'title']

	constructor(public data?: any)
	{}

	debugEvents()
	{
		this.onAttribute = (name: string, value: string) => console.log('attribute', name, '=', value)
		this.onTagOpen   = (name: string) => console.log('tag.open =', name)
		this.onTagOpened = (name: string) => console.log('tag.opened =', name)
		this.onTagClose  = (name: string) => console.log('tag.closed =', name)
	}

	getPosition()
	{
		return { index, start, target }
	}

	parseBuffer(buffer: string): string
	{
		this.setSource(buffer)
		return this.parseVars()
	}

	parseExpression(data: any, close: string, finalClose: string = '')
	{
		const finalChar = finalClose.length ? finalClose[0] : ''
		const indexOut  = index
		let   open      = source[index]

		if (open === '<') {
			index += 3
			open   = '{'
		}

		index ++
		if ((index >= length) || !source[index].match(new RegExp('[a-z0-9@%"\'' + open + close + ']', 'i'))) {
			return
		}

		const targetStack: string[] = []
		targetStack.push(target + source.substring(start, indexOut))
		start  = index
		target = ''

		while (index < length) {
			const char = source[index]

			if (char === open) {
				targetStack.push(target + source.substring(start, index))
				index  ++
				start  = index
				target = ''
				continue
			}

			if (
				(char === close)
				|| ((char === finalChar) && (source.substring(index, index + finalClose.length) === finalClose))
			) {
				const expression = target + source.substring(start, index)
				const lastTarget = targetStack.pop()
				const parsed     = this.parsePath(expression, data)
				index           += (char === close) ? 1 : finalClose.length
				start            = index
				target           = ''
				if (char === finalChar) while (targetStack.length) {
					target += targetStack.shift()
				}
				if (translating && !targetStack.length) {
					translateCount ++
					translateParts.push(parsed)
					target += lastTarget + '$' + translateCount
				}
				else if ((lastTarget === '') && (target === '')) {
					target = parsed
				}
				else {
					target += lastTarget + parsed
				}
				if (!targetStack.length) {
					return
				}
				continue
			}

			if ((char === '"') || (char === "'")) {
				index ++
				while ((index < length) && (source[index] !== char)) {
					if (source[index] === '\\') index ++
					index ++
				}
			}

			index ++
		}
		// bad close
		while (targetStack.length > 1) {
			target = targetStack.pop() + open + target
		}
		target = targetStack.pop() + (finalClose.length ? '<!--' : open) + target
	}

	async parseFile(fileName: string): Promise<string>
	{
		return this.parseBuffer(await readFile(fileName, 'utf-8'))
	}

	parsePath(expression: string, data: any)
	{
		for (const variable of expression.split('.')) {
			data = this.parseVariable(variable, data)
		}
		return data
	}

	parseVariable(variable: string, data: any)
	{
		if (
			(variable.startsWith('"') && variable.endsWith('"'))
			|| (variable.startsWith("'") && variable.endsWith("'"))
		) {
			return variable.substring(1, variable.length - 1)
		}
		switch (variable) {
			case 'BEGIN':
				return data
			case '@title':
				return 'title'
			case '@display':
				return (data instanceof ReflectProperty)
					? propertyDisplayOf(data.class.object ?? data.class.type, data.name)
					: classDisplayOf(data)
			case '@output':
				return outputOf(data)
			case '@route':
				return 'a/route'
			case '%properties':
				return properties(data)
			default:
				if (data[variable] === undefined) {
					data = new Str(data)
				}
				const value = data[variable]
				return (typeof value === 'function')
					? value.call(data)
					: value
		}
	}

	parseVars()
	{
		const blockStack:  BlockStack = []
		let   blockStart              = 0
		let   collection:  any[]      = []
		let   data                    = this.data
		let   iteration               = 0
		let   iterations              = 0
		const targetStack: string[]   = []

		while (index < length) {
			let char = source[index]

			// expression
			if ((char === '{') && this.doExpression) {
				this.parseExpression(data, '}')
				continue
			}

			// tag ?
			if (char !== '<') {
				index ++
				continue
			}

			char = source[++index]
			if (char === '!') {
				char = source[++index]
				index ++

				// cdata section
				if ((char === '[') && (source.substring(index, index + 6) === 'CDATA[') && !this.doExpression) {
					start = source.indexOf(']]>', index + 6) + 3
					if (start === 2) {
						start = length
					}
					index = start
					continue
				}

				// comment tag
					if ((char === '-') && (source[index] === '-')) {
					index ++
					if (!this.doExpression) {
						index = source.indexOf('-->', index) + 3
						if (index === 2) {
							index = length
						}
						continue
					}

					if (!source[index].match(/[a-z0-9@%{]/i)) {
						continue
					}

					// end condition / loop
					const indexOut = index - 4
					if (['end-->', 'END-->'].includes(source.substring(index, index + 6))) {
						target += this.trimEndLine(source.substring(start, indexOut))
						iteration ++
						if (iteration < iterations) {
							data  = collection[iteration]
							index = start = blockStart
							continue
						}
						({ blockStart, collection, data, iteration, iterations } = blockStack.pop()
							?? { blockStart: 0, collection: [], data: undefined, iteration: 0, iterations: 0 })
						index += 6
						start  = index
						continue
					}

					// begin condition / loop
					blockStack.push({ blockStart, collection, data, iteration, iterations })
					let blockData: any
					if (indexOut > start) {
						target += this.trimEndLine(source.substring(start, indexOut))
						start   = indexOut
					}
					const backTarget = target
					index  = indexOut
					target = ''
					this.parseExpression(data, '}', '-->')
					blockData  = target
					blockStart = start = index
					iteration  = 0
					target     = backTarget
					if (Array.isArray(blockData)) {
						collection = blockData
						data       = collection[0]
						iterations = collection.length
					}
					else {
						collection = []
						data       = blockData
						iterations = data ? 1 : 0
					}
					continue
				}
			}

			// tag close
			if (char === '/') {
				index ++
				const closeTagName = source.substring(index, source.indexOf('>', index))
				index += closeTagName.length + 1
				if (this.onText)     this.onText.call(this, text)
				if (this.onTagClose) this.onTagClose.call(this, closeTagName)
				continue
			}

			// tag open
			const position = index
			while ((index < length) && !' >\n\r\t\f'.includes(source[index])) index ++
			const tagName = source.substring(position, index)
			if (this.onTagOpen) this.onTagOpen.call(this, tagName)
			if (source[index] === '>') {
				index ++
				if (this.onTagOpened) this.onTagOpened.call(this, tagName)
				continue
			}

			// first attribute
			do index ++; while (' \n\r\t\f'.includes(source[index]))

			// attributes
			while (source[index] !== '>') {

				// attribute name
				const position = index
				while ((index < length) && !' =>\n\r\t\f'.includes(source[index])) index ++
				const attributeName = source.substring(position, index)
				while (' \n\r\t\f'.includes(source[index])) index ++

				// attribute value
				if (source[index] === '=') {
					index ++
					while (' \n\r\t\f'.includes(source[index])) index ++
					const [open, close] = ['action', 'href', 'location'].includes(attributeName)
						? ['(', ')']
						: ['{', '}']
					let quote = source[index]
					if ((quote === '"') || (quote === "'")) {
						index ++
					}
					else {
						quote = ' >'
					}

					translating = this.translateAttributes.includes(attributeName)
					if (translating) {
						if (index > start) {
							target += source.substring(start, index)
							start   = index
						}
						targetStack.push(target)
						target  = ''
					}

					const position   = index
					const shortQuote = !(quote.length - 1)
					while (index < length) {
						const char = source[index]
						if (shortQuote ? (char === quote) : quote.includes(char)) {
							if (translating) {
								target += source.substring(start, index)
								start   = index
								target  = targetStack.pop() as string + tr(target, translateParts)
								translateCount = 0
								translateParts = []
							}
							if (this.onAttribute) this.onAttribute(attributeName, source.substring(position, index))
							if (char !== '>') index ++
							break
						}
						// expression in attribute value
						if ((char === open) && this.doExpression) {
							this.parseExpression(data, close)
							continue
						}
						index ++
					}
				}
				else if (this.onAttribute) this.onAttribute(attributeName, '')

				// next attribute
				while (' \n\r\t\f'.includes(source[index])) index ++
			}
			if (this.onTagOpened) this.onTagOpened.call(this, tagName)

			index ++

			// script
			if (tagName === 'script') {
				if (this.onTagClose) this.onTagClose.call(this, 'script')
				index = source.indexOf('</script>', index) + 9
				if (index === 8) break
			}
		}
		return target + source.substring(start)
	}

	setSource(setSource: string, setIndex = 0, setStart?: number, setTarget?: string, setText?: string)
	{
		index  = setIndex
		length = setSource.length
		source = setSource
		start  = setStart  ?? index
		target = setTarget ?? ''
		text   = setText   ?? ''
	}

	trimEndLine(string: string)
	{
		let index = string.length
		while ((index > 0) && ' \n\r\t\f'.includes(string[index - 1])) {
			index --
			if (string[index] === "\n") {
				break
			}
		}
		return string.substring(0, index)
	}

}
