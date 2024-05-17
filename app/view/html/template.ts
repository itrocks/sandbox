import { readFile }    from 'node:fs/promises'
import path            from 'path'
import { appPath }     from '../../app'
import { tr }          from '../../locale/translate'
import { SortedArray } from '../../sorted-array'
import Str             from '../str'
import parseDecorator  from './parseDecorator'
import parseReflect    from './parseReflect'

type BlockStack = Array<{ blockStart: number, collection: any[], data: any, iteration: number, iterations: number }>

let doIt = 0
let index:    number
let length:   number
let source:   string
let start:    number
let tagName:  string
let tagStack: { tagName: string, translating: boolean }[]
let target:   string

let targetStack:        string[]
let transLock:          boolean
let translateParts:     string[]
let translatePartStack: string[][]
let translating:        boolean

export const frontScripts = new Array<string>

export default class Template
{
	doExpression = true
	doTranslate  = true

	fileName?: string
	filePath?: string

	included = false

	onAttribute?: ((name: string, value: string) => void)
	onTagOpen?:   ((name: string) => void)
	onTagOpened?: ((name: string) => void)
	onTagClose?:  ((name: string) => void)

	// Translate these attribute values.
	attributeTranslate = new SortedArray('alt', 'enterkeyhint', 'label', 'lang', 'placeholder', 'srcdoc', 'title')

	// Inline elements are replaced by $1 when in translated phrase.
	// TODO check if this really matches elements displayed inline
	elementInline = new SortedArray(
		'a', 'b', 'big', 'button', 'cite', 'code', 'data', 'del', 'em', 'font', 'i', 'img', 'input', 'ins',
		'kbd', 'label', 'mark', 'meter', 'optgroup', 'option', 'output', 'picture', 'q', 'rt',
		'samp', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'svg', 'time', 'tspan', 'u', 'var', 'wbr'
	)

	// Translate these element contents.
	elementTranslate = new SortedArray(
		'a', 'abbr', 'acronym', 'article', 'aside', 'b', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button',
		'caption', 'center', 'cite', 'data', 'datalist', 'dd', 'del', 'desc', 'details', 'dfn', 'dialog', 'div', 'dt',
		'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'iframe', 'ins', 'keygen', 'label', 'legend', 'li',
		'main', 'mark', 'menuitem', 'meter', 'nav', 'noframes', 'noscript', 'optgroup', 'option', 'p', 'pre',
		'q', 'rb', 's', 'section', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'summary', 'sup',
		'td', 'template', 'text', 'textarea', 'textpath', 'th', 'time', 'title', 'tspan', 'u', 'wbr'
	)

	// These elements have no closing tag.
	unclosingTags = new SortedArray(
		'area', 'base', 'basefont', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param',
		'source', 'track'
	)

	constructor(public data?: any)
	{
	}

	closeTag(shouldTranslate: boolean, targetIndex: number)
	{
		shouldTranslate ||= translating;
		({ tagName, translating } = tagStack.pop() ?? { tagName: '', translating: false })
		if (this.onTagClose) this.onTagClose.call(this, tagName)
		if ((tagName[0] === 'a') && (tagName === 'address')) {
			transLock = false
		}
		if (translating && this.elementInline.includes(tagName)) {
			if (this.elementTranslate.includes(tagName)) {
				this.translateTarget(targetIndex)
			}
			translateParts = translatePartStack.pop() as string[]
			if (target.length) doIt ++
			if (index > start) doIt ++
			translateParts.push(target + source.substring(start, index))
			start           = index
			target          = targetStack.pop() + '$' + translateParts.length
			shouldTranslate = false
		}
		return shouldTranslate
	}

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
			targetStack.push(target)
			target = ''
		}

		if (open === '<') {
			index += 3
			open   = '{'
		}

		index ++
		if ((index >= length) || !new RegExp('[a-z0-9@%."\'' + open + close + ']', 'i').test(source[index])) {
			return
		}

		let stackPos = targetStack.length
		if (target.length) doIt ++
		if (indexOut > start) doIt ++
		targetStack.push(target + source.substring(start, indexOut))
		start  = index
		target = ''

		while (index < length) {
			const char = source[index]

			if (char === open) {
				if (target.length) doIt ++
				if (index > start) doIt ++
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
				if (char === finalChar) while (targetStack.length > stackPos) {
					target += targetStack.shift()
				}
				if (translating && (targetStack.length === stackPos)) {
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
				if (targetStack.length === stackPos) {
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
		stackPos ++
		while (targetStack.length > stackPos) {
			target = targetStack.pop() + open + target
		}
		target = targetStack.pop() + (finalClose.length ? '<!--' : open) + target
	}

	async parseFile(fileName: string)
	{
		this.fileName = fileName.substring(fileName.lastIndexOf('/') + 1)
		this.filePath = fileName.substring(0, fileName.lastIndexOf('/'))
		return this.parseBuffer(await readFile(fileName, 'utf-8'))
	}

	parsePath(expression: string, data: any)
	{
		if (expression === '') {
			return undefined
		}
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
		if (variable[0] === '@') return parseDecorator(variable, data)
		if (variable[0] === '%') return parseReflect(variable, data)
		switch (variable) {
			case '':
			case 'BEGIN':
				return data
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

			const tagIndex = index
			char = source[++index]
			if (char === '!') {
				if (translating) {
					this.translateTarget(tagIndex)
				}
				char = source[++index]
				index ++

				// comment tag
				if ((char === '-') && (source[index] === '-')) {
					index ++
					if (
						!/[a-z0-9@%{]/i.test(source[index])
						|| !this.doExpression
						|| ((source[index] === 'B') && this.included && (source.substring(index, index + 8) === 'BEGIN-->'))
						|| ((source[index] === 'E') && this.included && (source.substring(index, index + 6) === 'END-->'))
					) {
						index = source.indexOf('-->', index) + 3
						if (index === 2) break
						if (translating && (index > start)) {
							this.sourceToTarget()
						}
						continue
					}

					// end condition / loop
					if (['end-->', 'END-->'].includes(source.substring(index, index + 6))) {
						target += this.trimEndLine(source.substring(start, tagIndex))
						iteration ++
						if (iteration < iterations) {
							data  = collection[iteration]
							index = start = blockStart
							if (translating && (index > start)) {
								this.sourceToTarget()
							}
							continue
						}
						({ blockStart, collection, data, iteration, iterations } = blockStack.pop()
							?? { blockStart: 0, collection: [], data: undefined, iteration: 0, iterations: 0 })
						index += 6
						start  = index
						if (translating && (index > start)) {
							this.sourceToTarget()
						}
						continue
					}

					// begin condition / loop
					blockStack.push({ blockStart, collection, data, iteration, iterations })
					let blockData: any
					if (tagIndex > start) {
						target += this.trimEndLine(source.substring(start, tagIndex))
						start   = tagIndex
					}
					const backTarget      = target
					const backTranslating = translating
					index       = tagIndex
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
					if (translating && (index > start)) {
						this.sourceToTarget()
					}
					continue
				}

				// cdata section
				if ((char === '[') && (source.substring(index, index + 6) === 'CDATA[')) {
					index = source.indexOf(']]>', index + 6) + 3
					if (index === 2) break
				}

				// DOCTYPE
				else {
					index = source.indexOf('>', index) + 1
				}

				if (translating) {
					this.sourceToTarget()
				}
				continue
			}

			// tag close
			if (char === '/') {
				index ++
				const closeTagName = source.substring(index, source.indexOf('>', index))
				index += closeTagName.length + 1
				let shouldTranslate = translating
				if (!this.unclosingTags.includes(closeTagName)) {
					do {
						shouldTranslate = this.closeTag(shouldTranslate, tagIndex)
					}
					while ((tagName !== closeTagName) && tagName.length)
				}
				if (shouldTranslate) {
					transLock = false
					this.translateTarget(tagIndex)
				}
				if (translating && (index > start)) {
					this.sourceToTarget()
				}
				continue
			}

			// tag open
			while ((index < length) && !' >\n\r\t\f'.includes(source[index])) index ++
			tagName = source.substring(tagIndex + 1, index)
			if (this.onTagOpen) this.onTagOpen.call(this, tagName)
			while (' \n\r\t\f'.includes(source[index])) index ++
			char = tagName[0]

			const unclosingTag = this.unclosingTags.includes(tagName)
			if (!unclosingTag) {
				tagStack.push({ tagName, translating })
			}
			let inlineElement = false
			let pushedParts   = false
			if (translating) {
				inlineElement = this.elementInline.includes(tagName)
				if (inlineElement) {
					if (translateParts.length) {
						if (target.length) doIt ++
						if (tagIndex > start) doIt ++
						targetStack.push(target + source.substring(start, tagIndex))
					}
					else {
						if (target.length) doIt ++
						if (tagIndex > start) doIt ++
						targetStack.push(target, source.substring(start, tagIndex))
					}
					start  = tagIndex
					target = ''
					if (!unclosingTag) {
						translatePartStack.push(translateParts)
						translateParts = []
						pushedParts    = true
					}
				}
				else {
					this.translateTarget(tagIndex)
				}
			}
			const elementTranslating = translating

			// attributes
			let   hasTypeSubmit = false
			const inInput       = (char === 'i') && (tagName === 'input')
			const inLink        = (char === 'l') && (tagName === 'link')
			const inScript      = (char === 's') && (tagName === 'script')
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
					const attributeChar = attributeName[0]
					const [open, close] = (
						'afhls'.includes(attributeChar)
						&& ['action', 'formaction', 'href', 'location', 'src'].includes(attributeName)
					) ? ['(', ')']
						: ['{', '}']
					let quote = source[index]
					if ((quote === '"') || (quote === "'")) {
						index ++
					}
					else {
						quote = ' >'
					}

					translating = this.doTranslate && this.attributeTranslate.includes(attributeName)
						|| (hasTypeSubmit && (attributeChar === 'v') && (attributeName === 'value'))
					if (translating && !pushedParts && unclosingTag && translateParts.length) {
						translatePartStack.push(translateParts)
						translateParts = []
						pushedParts    = true
					}

					const inLinkHRef  = inLink   && (attributeChar === 'h') && (attributeName === 'href')
					const inScriptSrc = inScript && (attributeChar === 's') && (attributeName === 'src')
					if ((inLinkHRef || inScriptSrc || translating) && (index > start)) {
						this.sourceToTarget()
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
									(attributeChar === 't') && (attributeValue[0] === 's')
									&& (attributeName === 'type') && (attributeValue === 'submit')
								)
							}
							if (translating) {
								this.translateTarget(index)
							}
							if (inLinkHRef && attributeValue.endsWith('.css')) {
								target += path.normalize(this.filePath + '/' + source.substring(start, index)).substring(appPath.length)
								start   = index
							}
							if (inScriptSrc && attributeValue.endsWith('.js')) {
								const frontScript = path.normalize(this.filePath + '/' + source.substring(start, index)).substring(
									appPath.length
								)
								if (!frontScripts.includes(frontScript)) {
									frontScripts.push(frontScript)
								}
								target += frontScript
								start   = index
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

			// skip script content
			if (inScript) {
				if (this.onTagClose) this.onTagClose.call(this, 'script')
				index = source.indexOf('</script>', index) + 9
				if (index === 8) break
				if (translating && (index > start)) {
					this.sourceToTarget()
				}
				continue
			}

			if (unclosingTag) {
				if (pushedParts) {
					translateParts = translatePartStack.pop() as string[]
				}
				translating = elementTranslating
				if (this.onTagClose) this.onTagClose.call(this, tagName)
				if (translating) {
					if (index > start) {
						this.sourceToTarget()
					}
					if (inlineElement) {
						translateParts.push(target)
						target = targetStack.pop() + '$' + translateParts.length
					}
				}
			}
			else {
				transLock ||= (tagName[0] === 'a') && (tagName === 'address')
				translating = this.doTranslate && !transLock && this.elementTranslate.includes(tagName)
				if (translating && (index > start)) {
					this.sourceToTarget()
				}
			}
		}
		if (tagStack.length) {
			let shouldTranslate = translating
			while (tagStack.length) {
				shouldTranslate = this.closeTag(shouldTranslate, length)
			}
			if (shouldTranslate) {
				this.translateTarget(length)
			}
			return target
		}
		if (translating) {
			this.translateTarget(index)
		}
		if (start < length) {
			target += source.substring(start)
			start   = length
		}
		return target
	}

	setSource(setSource: string, setIndex = 0, setStart?: number, setTarget = '')
	{
		index    = setIndex
		length   = setSource.length
		source   = setSource
		start    = setStart ?? index
		tagName  = ''
		tagStack = []
		target   = setTarget

		targetStack        = []
		transLock          = false
		translatePartStack = []
		translateParts     = []
		translating        = this.doTranslate
	}

	sourceToTarget()
	{
		target += source.substring(start, index)
		start   = index
	}

	tr(text: string, parts?: string[])
	{
		const original = text
		text           = text.trimEnd()
		const right    = text.length
		let left       = text.length
		text           = text.trimStart()
		left          -= text.length
		text           = parts && /^(\$[1-9][0-9]*)+$/.test(text) ? parts.join('') : text.length ? tr(text, parts) : text
		return original.substring(0, left) + text + original.substring(right)
	}

	translateTarget(index: number)
	{
		if (!translateParts.length) {
			target += this.tr(source.substring(start, index))
			start   = index
			return
		}
		target        += source.substring(start, index)
		start          = index
		target         = (targetStack.pop() ?? '') + this.tr(target, translateParts)
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
