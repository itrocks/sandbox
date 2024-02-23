import { readFile }                       from 'node:fs/promises'
import { properties }                     from '../../class/reflect'
import ReflectProperty                    from '../../property/reflect'
import { displayOf as classDisplayOf }    from '../class/display'
import { outputOf }                       from '../class/output'
import { displayOf as propertyDisplayOf } from '../property/display'
import Str                                from '../str'

const DEBUG = false

type BlockStack = Array<{ blockStart: number, collection: any[], data: any, iteration: number, iterations: number }>

export default class Template
{

	constructor(public data?: any)
	{}

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
				index           += (char === close) ? 1 : finalClose.length
				start            = index
				const parsed     = this.parsePath(expression, data)
				let   popTarget  = targetStack.pop()
				target = (popTarget === '') ? parsed : (popTarget + parsed)
				if (char === finalChar) while (targetStack.length) {
					popTarget = targetStack.pop()
					if (popTarget !== '') {
						target = popTarget + target
					}
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
		let   tagStack:    string[]   = []
		let   start                   = 0
		let   target:      any        = ''
		const targetStack: string[]   = []

		while (index < length) {
			const char = source[index]

			// expression
			if (char === '{') {
				({ index, start, target } = this.parseExpression(index, start, target, source, data, '}'))
				continue
			}

			// tag ?
			if (char !== '<') {
				index ++
				continue
			}

			// comment tag
			if (source.substring(index, index + 4) === '<!--') {
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

			// closing tag name
			index ++
			if (source[index] === '/') {
				index ++
				const closeTagName = source.substring(index, source.indexOf('>', index))
				let   popTagName: string|undefined
				index += closeTagName.length + 1
				while (popTagName = tagStack.pop()) {
					if (popTagName === closeTagName) break
				}
				if (DEBUG) console.log('tag.closed =', closeTagName)
				continue
			}

			// opening tag name
			const position = index
			while ((index < length) && !' >\n\r\t\f'.includes(source[index])) index ++
			const tagName = source.substring(position, index)
			if (DEBUG) console.log('tag.open =', tagName)
			tagStack.push(tagName)
			if (source[index] === '>') {
				index ++
				if (DEBUG) console.log('tag.opened =', tagName)
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
				if (DEBUG) console.log('attributeName =', attributeName)

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
							const attributeValue = source.substring(position, index)
							if (DEBUG) console.log('attributeValue =', attributeValue)
							if (char !== '>') index ++
							break
						}
						// begin expression in attribute value
						if (char === open) {
							({ index, start, target } = this.parseExpression(index, start, target, source, data, close))
							continue
						}
						index ++
					}
				}

				// next attribute
				while (' \n\r\t\f'.includes(source[index])) index ++
			}
			if (DEBUG) console.log('tag.opened =', tagName)

			index ++
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
