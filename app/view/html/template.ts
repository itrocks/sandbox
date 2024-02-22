import { readFile }                       from 'node:fs/promises'
import { properties }                     from '../../class/reflect'
import ReflectProperty                    from '../../property/reflect'
import { displayOf as classDisplayOf }    from '../class/display'
import { outputOf }                       from '../class/output'
import { displayOf as propertyDisplayOf } from '../property/display'
import Str                                from '../str'

type BlockStack = Array<{ blockStart: number, collection: any[], data: any, iteration: number, iterations: number }>
type Close      = '' | '"' | ')' | '-->' | '}'
type Stack      = Array<{ close: Close, target: string }>

export default class Template
{

	data: any

	file: string

	constructor(file: string, data: any)
	{
		this.data = data
		this.file = file
	}

	parseBuffer(source: string): string
	{
		return this.parseVars(source)
	}

	protected parseExpression(expression: string, data: any)
	{
		for (const variable of expression.split('.')) {
			data = this.parseVariable(variable, data)
		}
		return data
	}

	async parseFile(): Promise<string>
	{
		return this.parseBuffer(await readFile(this.file, 'utf-8'))
	}

	protected parseVariable(variable: string, data: any)
	{
		switch (variable) {
			case 'BEGIN':
				return data
			case '@title':
				return 'titre'
			case '@display':
				return (data instanceof ReflectProperty)
					? propertyDisplayOf(data.class.object ?? data.class.type, data.name)
					: classDisplayOf(data)
			case '@output':
				return outputOf(data)
			case '@route':
				return 'une/route'
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

	protected parseVars(source: string)
	{
		let   acceptParenthesis      = false
		let   acceptTag              = true
		const blockStack: BlockStack = []
		let   blockStart             = 0
		let   close:      Close      = ''
		let   collection: any[]      = []
		let   data                   = this.data
		let   index                  = 0
		let   iteration              = 0
		let   iterations             = 0
		const length                 = source.length
		const stack:      Stack      = []
		let   start                  = 0
		let   tagName                = ''
		let   tagStack:   string[]   = []
		let   target                 = ''

		while (index < length) {
			const char = source[index]

			if (
				(char === '{')
				&& source[index + 1].match(/[a-z@%A-Z0-9]/)
			) {
				stack.push({ close, target: target + source.substring(start, index) })
				index ++
				close  = '}'
				start  = index
				target = ''
				continue
			}

			if ((char === '<') && acceptTag) {
				if (source.substring(index, index + 4) === '<!--') {
					if (source[index + 4].match(/[a-z0-9@%]/i)) {
						const mayBeEnd = source.substring(index + 4, index + 10)
						if ((mayBeEnd === 'end-->') || (mayBeEnd === 'END-->')) {
							iteration++
							if (iteration < iterations) {
								data    =  collection[iteration]
								target += source.substring(start, index)
								index   =  start = blockStart
								continue
							}
							const block = target;
							({ close, target } = stack.pop() ?? { close: '', target: '' })
							target += block + source.substring(start, index);
							({ blockStart, collection, data, iteration, iterations } = blockStack.pop()
								?? { blockStart: 0, collection: [], data: undefined, iteration: 0, iterations: 0 })
							index += 10
							start  = index
							continue
						}
						stack.push({ close, target: target + source.substring(start, index) })
						index += 4
						close  = '-->'
						start  = index
						target = ''
						continue
					}
				}
				else {
					index ++
					const endTag = (source[index] === '/') ? '/' : ''
					if (endTag) {
						index ++
					}
					const position = index
					while (source[index].match(/[a-z]/i)) {
						index ++
					}
					if (index > position) {
						tagName = source.substring(position, index)
						if (endTag) {
							while (tagStack.pop() !== tagName) {}
							tagName = tagStack.length ? tagStack[tagStack.length - 1] : ''
						}
						else {
							tagStack.push(tagName)
						}
					}
					continue
				}
			}

			if (tagName) {
				if (
					(char === 'h')
					&& (source.substring(index, index + 6) === 'href="')
				) {
					index += 6
					stack.push({ close, target: target + source.substring(start, index) })
					acceptParenthesis = true
					acceptTag         = false
					close  = '"'
					start  = index
					target = ''
					continue
				}

				if (
					(char === '(')
					&& acceptParenthesis
					&& source[index + 1].match(/[a-z@%A-Z0-9]/)
				) {
					stack.push({ close, target: target + source.substring(start, index) })
					close  = ')'
					index ++
					start  = index
					target = ''
					continue
				}
			}

			if (
				close.startsWith(char)
				&& (source.substring(index, index + close.length) === close)
			) {
				const expr = target + source.substring(start, index)
				if (close === '-->') {
					blockStack.push({ blockStart, collection, data, iteration: 0, iterations })
					const blockData = this.parseExpression(expr, data)
					index     += 3
					blockStart = start = index
					close      = ''
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
				let calc = true
				if (close === '"') {
					acceptParenthesis = false
					acceptTag         = true
					calc              = false
				}
				else {
					index += close.length
				}
				({ close, target } = stack.pop() ?? { close: '', target: '' })
				start   = index
				target += calc ? this.parseExpression(expr, data) : expr
				continue
			}

			index ++
		}
		return target + source.substring(start)
	}

}
