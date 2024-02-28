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

let targetStack:    string[]
let translateParts: string[]
let translating:    boolean

export default class Template
{
	doExpression = true
	doTranslate  = true

	onAttribute?: ((name: string, value: string) => void)
	onTagOpen?:   ((name: string) => void)
	onTagOpened?: ((name: string) => void)
	onTagClose?:  ((name: string) => void)
	onText?:      ((text: string) => void)

	// Translate these attribute content.
	translateAttributes = ['alt', 'enterkeyhint', 'label', 'placeholder', 'srcdoc', 'title']

	// Translate these element content. They are marks into the translated parent element phrase.
	translateComponents = [
		'a', 'big', 'button', 'data', 'font', 'label', 'meter', 'optgroup', 'option', 'select', 'span', 'strike', 'time'
	]

	// Translate these element content.
	translateElements = [
		'a', 'abbr', 'acronym', 'article', 'aside', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button',
		'caption', 'center', 'data', 'datalist', 'dd', 'details', 'dfn', 'dialog', 'div', 'dt',
		'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'iframe', 'keygen', 'label', 'legend', 'li',
		'main', 'menuitem', 'meter', 'nav', 'noframes', 'noscript', 'option', 'optgroup', 'option', 'p', 'pre', 'rb',
		's', 'section', 'select', 'span', 'strike', 'summary', 'td', 'template', 'textarea', 'th', 'time', 'title'
	]

	// These tags are ignored: they are part of the translated text.
	translateIgnore = ['b', 'cite', 'del', 'em', 'i', 'ins', 'mark', 'q', 'small', 'strong', 'sub', 'sup', 'u', 'wbr']

	// Do not translate these element content. They are marks into the translated parent element phrase.
	translateMark = ['code', 'kbd', 'img', 'input', 'picture', 'output', 'rt', 'samp', 'svg', 'var']

	// Do not translate these element content. When they are closed, gets the parent element translation status back.
	translateNotElements = [
		'address', 'applet', 'area', 'audio', 'base', 'basefont', 'canvas', 'col', 'colgroup', 'dir', 'dl', 'embed',
		'frame', 'frameset', 'head', 'html', 'link', 'map', 'menu', 'meta', 'object', 'ol', 'param', 'progress',
		'ruby', 'script', 'source', 'style', 'table', 'tbody', 'tfoot', 'thead', 'track', 'ul', 'video'
	]

	// These elements have no closing tag.
	unclosing = [
		'area', 'base', 'basefont', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source',
		'track'
	]

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

	parseBuffer(buffer: string)
	{
		this.setSource(buffer)
		return this.parseVars()
	}

	parseExpression(data: any, close: string, finalClose = '')
	{
		const finalChar = finalClose.length ? finalClose[0] : ''
		const indexOut  = index
		let   open      = source[index]

		if (translating && !translateParts.length) {
			this.translateStack()
		}

		if (open === '<') {
			index += 3
			open   = '{'
		}

		index ++
		if ((index >= length) || !new RegExp('[a-z0-9@%"\'' + open + close + ']', 'i').test(source[index])) {
			return
		}

		const targetStack = [] as string[]
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
					translateParts.push(parsed)
					target += lastTarget + '$' + translateParts.length
					return
				}
				if ((lastTarget === '') && (target === '')) {
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

	async parseFile(fileName: string)
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
		if (variable[0] === '@') {
			if ((typeof data !== 'function') && (typeof data !== 'object')) {
				console.error('Bad data for variable', variable, 'data', data)
			}
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
		const blockStack  = [] as BlockStack
		let   blockStart  = 0
		let   collection  = []
		let   data        = this.data
		let   iteration   = 0
		let   iterations  = 0
		const tagStack    = [] as { tagName: string, translating: boolean }[]

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
				if (translating) {
					this.translateTarget(index - 1)
				}
				char = source[++index]
				index ++

				// comment tag
				if ((char === '-') && (source[index] === '-')) {
					index ++
					if (!(/[a-z0-9@%{]/i.test(source[index]) && this.doExpression)) {
						index = source.indexOf('-->', index) + 3
						if (index === 2) break
						if (translating) {
							this.translateStart()
						}
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
							if (translating) {
								this.translateStart()
							}
							continue
						}
						({ blockStart, collection, data, iteration, iterations } = blockStack.pop()
							?? { blockStart: 0, collection: [], data: undefined, iteration: 0, iterations: 0 })
						index += 6
						start  = index
						if (translating) {
							this.translateStart()
						}
						continue
					}

					// begin condition / loop
					blockStack.push({ blockStart, collection, data, iteration, iterations })
					let blockData: any
					if (indexOut > start) {
						target += this.trimEndLine(source.substring(start, indexOut))
						start   = indexOut
					}
					const backTarget      = target
					const backTranslating = translating
					index       = indexOut
					target      = ''
					translating = false
					this.parseExpression(data, '}', '-->')
					blockData   = target
					blockStart  = index
					iteration   = 0
					target      = backTarget
					translating = backTranslating
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
					if (translating) {
						this.translateStart()
					}
					continue
				}

				// cdata section
				if ((char === '[') && (source.substring(index, index + 6) === 'CDATA[')) {
					index = source.indexOf(']]>', index + 6) + 3
					if (index === 2) break
					if (translating) {
						this.translateStart()
					}
					continue
				}

				// DOCTYPE
				if (translating) {
					this.translateStart()
				}
				continue
			}

			// tag close
			if (char === '/') {
				const indexOut = index - 1
				index ++
				const closeTagName = source.substring(index, source.indexOf('>', index))
				index += closeTagName.length + 1
				if (this.onText)     this.onText.call(this, text)
				if (this.onTagClose) this.onTagClose.call(this, closeTagName)
				let shouldTranslate = false
				let tagName: string
				do {
					shouldTranslate ||= translating;
					({ tagName, translating } = tagStack.pop() ?? { tagName: '', translating: false })
				}
				while ((tagName !== closeTagName) && (tagName !== ''))
				if (shouldTranslate) {
					this.translateTarget(indexOut)
				}
				if (translating) {
					this.translateStart()
				}
				continue
			}

			// tag open
			const tagIndex = index
			while ((index < length) && !' >\n\r\t\f'.includes(source[index])) index ++
			const tagName = source.substring(tagIndex, index)
			if (this.onTagOpen) this.onTagOpen.call(this, tagName)
			while (' \n\r\t\f'.includes(source[index])) index ++

			// script
			if (tagName === 'script') {
				if (translating) {
					this.translateTarget(tagIndex - 1)
				}
				if (this.onTagClose) this.onTagClose.call(this, 'script')
				index = source.indexOf('</script>', index) + 9
				if (index === 8) break
				if (translating) {
					this.translateStart()
				}
				continue
			}

			tagStack.push({ tagName, translating })
			if (translating) {
				this.translateTarget(tagIndex - 1)
			}

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

					translating = this.doTranslate && this.translateAttributes.orderedIncludes(attributeName)
					if (translating) {
						this.translateStart()
					}

					const position   = index
					const shortQuote = !(quote.length - 1)
					while (index < length) {
						const char = source[index]
						// end of attribute value
						if (shortQuote ? (char === quote) : quote.includes(char)) {
							if (translating) {
								this.translateTarget(index)
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
			index ++
			if (this.onTagOpened) this.onTagOpened.call(this, tagName)

			translating = this.doTranslate && this.translateElements.orderedIncludes(tagName)
			if (translating) {
				this.translateStart()
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

		targetStack    = []
		translateParts = []
		translating    = false
	}

	tr(text: string, parts?: string[])
	{
		const original = text
		text           = text.trimEnd()
		let right      = text.length
		let left       = text.length
		text           = text.trimStart()
		left          -= text.length
		return original.substring(0, left) + ((text === '') ? '' : tr(text, parts)) + original.substring(right)
	}

	translateStart()
	{
		target += source.substring(start, index)
		start   = index
	}

	translateStack()
	{
		targetStack.push(target)
		target  = ''
	}

	translateTarget(index: number)
	{
		if (!translateParts.length) {
			target += this.tr(source.substring(start, index))
			start   = index
			return
		}
		target += source.substring(start, index)
		start   = index
		target  = targetStack.pop() as string + (
			/^(\$[1-9][0-9]*)+$/.test(target)
				? translateParts.join('')
				: this.tr(target, translateParts)
		)
		translateParts = []
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
