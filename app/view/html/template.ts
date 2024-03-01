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

let targetStack:        string[]
let translateParts:     string[]
let translatePartStack: string[][]
let translating:        boolean

export default class Template
{
	doExpression = true
	doTranslate  = true

	onAttribute?: ((name: string, value: string) => void)
	onTagOpen?:   ((name: string) => void)
	onTagOpened?: ((name: string) => void)
	onTagClose?:  ((name: string) => void)

	// Translate these attribute values.
	attributeTranslate = ['alt', 'enterkeyhint', 'label', 'placeholder', 'srcdoc', 'title']

	// Do not translate these element contents. When they are closed, gets the parent element translation status back.
	elementNoTranslate = [
		'address', 'applet', 'area', 'audio', 'base', 'basefont', 'canvas', 'col', 'colgroup', 'dir', 'dl', 'embed',
		'frame', 'frameset', 'head', 'html', 'link', 'map', 'menu', 'meta', 'object', 'ol', 'param', 'progress',
		'ruby', 'script', 'source', 'style', 'table', 'tbody', 'tfoot', 'thead', 'track', 'ul', 'video'
	]

	// Translate these element contents.
	elementTranslate = [
		'a', 'abbr', 'acronym', 'article', 'aside', 'b', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button',
		'caption', 'center', 'cite', 'data', 'datalist', 'dd', 'del', 'desc', 'details', 'dfn', 'dialog', 'div', 'dt',
		'em', 'font', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'iframe', 'ins', 'keygen', 'label', 'legend', 'li',
		'main', 'mark', 'menuitem', 'meter', 'nav', 'noframes', 'noscript', 'option', 'optgroup', 'option', 'p', 'pre',
		'q', 'rb', 's', 'section', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'summary', 'sup',
		'td', 'template', 'text', 'textarea', 'textpath', 'th', 'time', 'title', 'tspan', 'u', 'wbr'
	]

	// Replace these elements by marks into parent text to translate. Do not translate content.
	markNoTranslate = ['code', 'img', 'input', 'kbd', 'output', 'picture', 'rt', 'samp', 'svg', 'var']

	// Replace these elements by marks into parent text to translate. Translate content.
	markTranslate = [
		'a', 'b', 'big', 'button', 'cite', 'data', 'del', 'em', 'font', 'i', 'ins', 'label', 'mark', 'meter',
		'optgroup', 'option', 'q', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
		'time', 'tspan', 'u', 'wbr'
	]

	// These elements have no closing tag.
	unclosingTags = [
		'area', 'base', 'basefont', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param',
		'source', 'track'
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

	getCleanContext()
	{
		return {
			index:              length,
			length:             source.length,
			source:             source,
			start:              length,
			target:             target,
			targetStack:        [] as string[],
			translatePartStack: [] as string[][],
			translateParts:     [] as string[],
			translating:        this.doTranslate
		}
	}

	getPosition()
	{
		return { index, start, target }
	}

	getContext()
	{
		return { index, length, source, start, target, targetStack, translatePartStack, translateParts, translating }
	}

	isContextClean()
	{
		const clean   = this.getCleanContext()
		const context = this.getContext()
		return context.index                   === clean.index
			&& context.length                    === clean.length
			&& context.start                     === clean.start
			&& context.targetStack.length        === clean.targetStack.length
			&& context.translatePartStack.length === clean.translatePartStack.length
			&& context.translateParts.length     === clean.translateParts.length
			&& context.translating               === clean.translating
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
				const lastTarget = targetStack.pop() as string
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
				if (lastTarget.length || target.length) {
					target += lastTarget + parsed
				}
				else {
					target = parsed
				}
				if (!targetStack.length) {
					return
				}
				continue
			}

			if ((char === '"') || (char === "'")) {
				index ++
				let c: string
				while ((index < length) && ((c = source[index]) !== char)) {
					if (c === '\\') index ++
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
		let   transLock   = false
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
			const indexOut = index - 1
			if (char === '/') {
				index ++
				const closeTagName = source.substring(index, source.indexOf('>', index))
				index += closeTagName.length + 1
				let shouldTranslate = translating
				if (!this.unclosingTags.includes(closeTagName)) {
					let tagName: string
					do {
						shouldTranslate ||= translating;
						({ tagName, translating } = tagStack.pop() ?? { tagName: '', translating: false })
						if (this.onTagClose) this.onTagClose.call(this, tagName)
						if (translating && this.markTranslate.orderedIncludes(tagName)) {
							this.translateTarget(indexOut)
							translateParts = translatePartStack.pop() as string[]
							translateParts.push(target + source.substring(start, index))
							start           = index
							target          = targetStack.pop() + '$' + translateParts.length
							shouldTranslate = false
						}
					}
					while ((tagName !== closeTagName) && tagName.length)
				}
				if (shouldTranslate) {
					transLock = false
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
			char = tagName[0]

			// script
			if ((char === 's') && (tagName === 'script')) {
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

			const unclosingTag = this.unclosingTags.orderedIncludes(tagName)
			if (!unclosingTag) {
				tagStack.push({tagName, translating})
			}
			if (translating) {
				if (this.markTranslate.orderedIncludes(tagName)) {
					if (translateParts.length) {
						target += source.substring(start, indexOut)
						start   = indexOut
					}
					targetStack.push(target)
					target = ''
					if (!translateParts.length) {
						targetStack.push(source.substring(start, indexOut))
						start = indexOut
					}
					translatePartStack.push(translateParts)
					translateParts = []
				}
				else {
					this.translateTarget(tagIndex - 1)
				}
			}
			const elementTranslating = translating

			// attributes
			let   hasTypeSubmit = false
			const inInput       = (char === 'i') && (tagName === 'input')
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

					translating = this.doTranslate && this.attributeTranslate.orderedIncludes(attributeName)
						|| (hasTypeSubmit && (attributeName[0] === 'v') && (attributeName === 'value'))

					if (translating) {
						this.translateStart()
					}

					const position   = index
					const shortQuote = !(quote.length - 1)
					while (index < length) {
						const char = source[index]
						// end of attribute value
						if (shortQuote ? (char === quote) : quote.includes(char)) {
							const attributeValue = source.substring(position, index)
							if (inInput) {
								hasTypeSubmit ||= (
									(attributeName[0] === 't') && (attributeName === 'type') && (attributeValue === 'submit')
								)
							}
							if (translating) {
								this.translateTarget(index)
							}
							if (this.onAttribute) this.onAttribute(attributeName, attributeValue)
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

			if (unclosingTag) {
				translating = elementTranslating
				if (this.onTagClose) this.onTagClose.call(this, tagName)
			}
			else {
				transLock ||= (tagName[0] === 'a') && (tagName === 'address')
				translating = this.doTranslate && !transLock && this.elementTranslate.orderedIncludes(tagName)
			}
			if (translating) {
				this.translateStart()
			}
		}
		if (!tagStack.length) {
			if (translating && (index > start)) {
				this.translateTarget(index)
			}
			if (start < source.length) {
				target += source.substring(start)
				start   = source.length
			}
			return target
		}
		let shouldTranslate = false
		while (tagStack.length) {
			let tagName: string
			shouldTranslate ||= translating;
			({ tagName, translating } = tagStack.pop() ?? { tagName: '', translating: false })
			if (this.onTagClose) this.onTagClose.call(this, tagName)
		}
		if (shouldTranslate) {
			this.translateTarget(source.length)
		}
		return target
	}

	setSource(setSource: string, setIndex = 0, setStart?: number, setTarget = '')
	{
		index  = setIndex
		length = setSource.length
		source = setSource
		start  = setStart ?? index
		target = setTarget

		targetStack        = []
		translatePartStack = []
		translateParts     = []
		translating        = this.doTranslate
	}

	tr(text: string, parts?: string[])
	{
		const original = text
		text           = text.trimEnd()
		let right      = text.length
		let left       = text.length
		text           = text.trimStart()
		left          -= text.length
		return original.substring(0, left) + (text.length ? tr(text, parts) : '') + original.substring(right)
	}

	translateStart()
	{
		target += source.substring(start, index)
		start   = index
	}

	translateStack()
	{
		targetStack.push(target)
		target = ''
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
