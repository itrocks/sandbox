import { readFile }                       from 'node:fs/promises'
import { properties }                     from '../../class/reflect'
import ReflectProperty                    from '../../property/reflect'
import { displayOf as classDisplayOf }    from '../class/display'
import { outputOf }                       from '../class/output'
import { displayOf as propertyDisplayOf } from '../property/display'
import Str                                from '../str'

type BlockStack = Array<{ blockStart: number, collection: any[], data: any, iteration: number, iterations: number }>

export default class Template
{
	doExpression = true

	onAttribute?: ((name: string, value: string) => void)
	onTagOpen?:   ((name: string) => void)
	onTagOpened?: ((name: string) => void)
	onTagClose?:  ((name: string) => void)

	constructor(public data?: any)
	{}

	debugEvents()
	{
		this.onAttribute = (name: string, value: string) => console.log('attribute', name, '=', value)
		this.onTagOpen   = (name: string) => console.log('tag.open =', name)
		this.onTagOpened = (name: string) => console.log('tag.opened =', name)
		this.onTagClose  = (name: string) => console.log('tag.closed =', name)
	}

	parseBuffer(source: string): string
	{
		return this.parseVars(source)
	}

	parseExpression(
		index: number, start: number, target: any, source: string, data: any, close: string, finalClose: string = ''
	): { index: number, start: number, target: any }
	{
		const finalChar = finalClose.length ? finalClose[0] : ''
		const indexOut  = index
		const length    = source.length
		let   open      = source[index]

		if (open === '<') {
			index += 3
			open   = '{'
		}

		index ++
		if ((index >= length) || !source[index].match(new RegExp('[a-z0-9@%"\'' + open + close + ']', 'i'))) {
			return { index, start, target }
		}

		const targetStack: string[]  = []
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
				if ((lastTarget === '') && (target === '')) {
					target = parsed
				}
				else {
					target += lastTarget + parsed
				}
				if (!targetStack.length) {
					return { index, start, target }
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
		while (targetStack.length > 1) {
			target = targetStack.pop() + open + target
		}
		target  = targetStack.pop() + (finalClose.length ? '<!--' : open) + target
		target += source.substring(start)
		start   = source.length
		return { index, start, target }
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

	parseVars(source: string)
	{
		const blockStack:  BlockStack = []
		let   blockStart              = 0
		let   collection:  any[]      = []
		let   data                    = this.data
		let   index                   = 0
		let   iteration               = 0
		let   iterations              = 0
		const length                  = source.length
		let   start                   = 0
		let   target:      any        = ''
		const targetStack: string[]   = []

		while (index < length) {
			const char = source[index]

			// expression
			if ((char === '{') && this.doExpression) {
				({ index, start, target } = this.parseExpression(index, start, target, source, data, '}'))
				continue
			}

			// tag ?
			if (char !== '<') {
				index ++
				continue
			}

			if (source[index + 1] === '!') {
				const nextChar = source[index + 2]

				// cdata section
				if ((nextChar === '[') && (source.substring(index, index + 9) === '<![CDATA[') && !this.doExpression) {
					start = source.indexOf(']]>', index + 9) + 3
					if (start === 2) {
						start = source.length
					}
					index = start
					continue
				}

				// comment tag
				if ((nextChar === '-') && (source.substring(index, index + 4) === '<!--')) {
					if (!this.doExpression) {
						index = source.indexOf('-->', index + 4) + 3
						if (index === 2) {
							index = source.length
						}
						continue
					}

					const indexIn = index + 4
					if (!source[indexIn].match(/[a-z0-9@%{]/i)) {
						continue
					}

					// end condition / loop
					if (['end-->', 'END-->'].includes(source.substring(indexIn, indexIn + 6))) {
						iteration ++
						if (iteration < iterations) {
							data    = collection[iteration]
							target += this.trimEndLine(source.substring(start, index))
							index   = start = blockStart
							continue
						}
						const block = target;
						target  = targetStack.pop() ?? ''
						target += block + this.trimEndLine(source.substring(start, index));
						({ blockStart, collection, data, iteration, iterations } = blockStack.pop()
							?? { blockStart: 0, collection: [], data: undefined, iteration: 0, iterations: 0 })
						index += 10
						start  = index
						continue
					}

					// begin condition / loop
					blockStack.push({ blockStart, collection, data, iteration, iterations })
					let blockData: any
					if (index > start) {
						target += this.trimEndLine(source.substring(start, index))
						start   = index
					}
					({ index, start, target: blockData } = this.parseExpression(index, start, '', source, data, '}', '-->'))
					blockStart = start = index
					iteration  = 0
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
			index ++
			if (source[index] === '/') {
				index ++
				const closeTagName = source.substring(index, source.indexOf('>', index))
				index += closeTagName.length + 1
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
					const position = index
					while (index < length) {
						const char = source[index]
						if ((quote.length === 1) ? (char === quote) : quote.includes(char)) {
							if (this.onAttribute) this.onAttribute(attributeName, source.substring(position, index))
							if (char !== '>') index ++
							break
						}
						// expression in attribute value
						if ((char === open) && this.doExpression) {
							({ index, start, target } = this.parseExpression(index, start, target, source, data, close))
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
