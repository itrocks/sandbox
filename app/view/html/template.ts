import { readFile }    from 'node:fs/promises'
import path, { sep }   from 'path'
import { appPath }     from '../../app'
import tr              from '../../locale/translate'
import { SortedArray } from '../../sorted-array'
import Str             from '../str'
import parseDecorator  from './parseDecorator'
import parseReflect    from './parseReflect'

type BlockStack = Array<{ blockStart: number, collection: any[], data: any, iteration: number, iterations: number }>

let blockBack:  number
let blockStack: BlockStack

let doHeadLinks = false

let index:       number
let length:      number
let source:      string
let start:       number
let tagName:     string
let tagStack:    { tagName: string, translating: boolean }[]
let target:      string
let targetStack: string[]

let transLock:          boolean
let translatePartStack: string[][]
let translateParts:     string[]
let translating:        boolean

export const frontScripts = new SortedArray<string>
frontScripts.distinct = true

let doneLinks      = new SortedArray<string>
let headLinks      = new SortedArray<string>
let headTitle      = undefined as string|undefined
doneLinks.distinct = true
headLinks.distinct = true

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
	attributeTranslate = new SortedArray(
		'alt', 'enterkeyhint', 'label', 'lang', 'placeholder', 'srcdoc', 'title'
	)

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

	constructor(public data?: any, public containerData?: any)
	{
		blockStack = []
		if (containerData) {
			blockStack.push({ blockStart: 0, collection: [], data: containerData, iteration: 0, iterations: 1 })
		}
		this.data = data
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
		const doneLinks = new SortedArray<string>
		doneLinks.distinct = true
		const headLinks = new SortedArray<string>
		headLinks.distinct = true
		return {
			doHeadLinks:        false,
			doneLinks:          doneLinks,
			headLinks:          headLinks,
			index:              length,
			length:             source.length,
			source:             source,
			start:              length,
			target:             target,
			targetStack:        [],
			translatePartStack: [],
			translateParts:     [],
			translating:        this.doTranslate
		}
	}

	getPosition()
	{
		return { index, start, target }
	}

	getContext()
	{
		return {
			doHeadLinks, doneLinks, headLinks, index, length, source, start, target, targetStack,
			translatePartStack, translateParts, translating
		}
	}

	async include(path: string, data: any)
	{
		const back = {
			doHeadLinks, index, length, source, start, tagName, tagStack, target, targetStack,
			translateParts, translatePartStack, translating, transLock
		}
		doHeadLinks = true

		const template    = new Template(data, blockStack[0]?.data)
		template.included = true

		template.doExpression = this.doExpression
		template.doTranslate  = this.doTranslate
		template.onAttribute  = this.onAttribute
		template.onTagClose   = this.onTagClose
		template.onTagOpen    = this.onTagOpen
		template.onTagOpened  = this.onTagOpened

		const parsed = await template.parseFile(
			((path[0] === sep) || (path[1] === ':')) ? path : (this.filePath + sep + path));

		({
			doHeadLinks, index, length, source, start, tagName, tagStack, target, targetStack,
			translateParts, translatePartStack, translating, transLock
		} = back)

		return parsed.substring(parsed.indexOf('<!--BEGIN-->') + 12, parsed.indexOf('<!--END-->'))
	}

	isContextClean()
	{
		const clean   = this.getCleanContext()
		const context = this.getContext()
		return context.doHeadLinks             === clean.doHeadLinks
			&& context.doneLinks.distinct        === clean.doneLinks.distinct
			&& context.doneLinks.length          === clean.doneLinks.length
			&& context.headLinks.distinct        === clean.headLinks.distinct
			&& context.headLinks.length          === clean.headLinks.length
			&& context.index                     === clean.index
			&& context.length                    === clean.length
			&& context.start                     === clean.start
			&& context.targetStack.length        === clean.targetStack.length
			&& context.translatePartStack.length === clean.translatePartStack.length
			&& context.translateParts.length     === clean.translateParts.length
			&& context.translating               === clean.translating
	}

	async parseBuffer(buffer: string)
	{
		this.setSource(buffer)
		await this.parseVars()
		if (doHeadLinks) {
			return target
		}
		if (headLinks.length) {
			const position = target.lastIndexOf('>', target.indexOf('</head>')) + 1
			target = target.slice(0, position) + '\n\t' + headLinks.join('\n\t') + target.slice(position)
			doneLinks = new SortedArray<string>
			doneLinks.distinct = true
			headLinks = new SortedArray<string>
			headLinks.distinct = true
		}
		if (headTitle && !this.included) {
			const position = target.indexOf('>', target.indexOf('<title') + 6) + 1
			target = target.slice(0, position) + headTitle + target.slice(target.indexOf('</title>', position))
		}
		return target
	}

	async parseExpression(data: any, close: string, finalClose = '')
	{
		const indexOut = index
		let   open     = source[index]

		if (translating && !translateParts.length) {
			targetStack.push(target)
			target = ''
		}

		if (open === '<') {
			index += 3
			open   = '{'
		}

		index ++
		const firstChar = source[index]
		if ((index >= length) || !this.startsExpression(firstChar, open, close)) {
			return
		}

		let   conditional = (firstChar === '?')
		const finalChar   = finalClose.length ? finalClose[0] : ''
		let   stackPos    = targetStack.length
		if (conditional) {
			index ++
		}
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
				let minus = 0
				if (source[index - 1] === '?') {
					conditional = true
					minus = 1
				}
				const expression = target + source.substring(start, index - minus)
				const lastTarget = targetStack.pop() as string
				const parsed     = await this.parsePath(expression, data)
				index += (char === close) ? 1 : finalClose.length
				start  = index
				target = ''
				if (char === finalChar) while (targetStack.length > stackPos) {
					target += targetStack.shift()
				}
				if (translating && (targetStack.length === stackPos)) {
					translateParts.push(parsed)
					target += lastTarget + '$' + translateParts.length
					return conditional
				}
				if (lastTarget.length || target.length) {
					target += lastTarget + parsed
				}
				else {
					target = parsed
				}
				if (targetStack.length === stackPos) {
					if (conditional && !parsed) {
						if ((typeof target)[0] === 's') {
							target = target.substring(0, target.lastIndexOf(' '))
							while ((index < length) && !' \n\r\t\f'.includes(source[index])) {
								index ++
								start ++
							}
							index --
						}
						return conditional
					}
					return conditional
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
		return conditional
	}

	async parseFile(fileName: string, containerFileName?: string): Promise<string>
	{
		if (containerFileName && !this.included) {
			const data = this.data
			this.data  = Object.assign({ content: () => this.include(fileName, data) }, blockStack[0]?.data)
			return this.parseFile(path.normalize(containerFileName))
		}
		this.fileName = fileName.substring(fileName.lastIndexOf(sep) + 1)
		this.filePath = fileName.substring(0, fileName.lastIndexOf(sep))
		return this.parseBuffer(await readFile(fileName, 'utf-8'))
	}

	async parsePath(expression: string, data: any)
	{
		if (expression === '') {
			return undefined
		}
		if ((expression[0] === '.') && (expression.startsWith('./') || expression.startsWith('../'))) {
			return await this.include(expression, data)
		}
		blockBack = 0
		for (const variable of expression.split('.')) {
			data = await this.parseVariable(variable, data)
		}
		return data
	}

	async parseVariable(variable: string, data: any)
	{
		if (variable === '') {
			return (typeof data === 'function')
				? await data.call()
				: data
		}
		if (variable === '*') {
			return (typeof data === 'object') ? Object.values(data) : data
		}
		const firstChar = variable[0]
		if ((firstChar === 'B') && (variable === 'BEGIN')) {
			return data
		}
		if (
			((firstChar === '"') && (variable[variable.length - 1] === '"'))
			|| ((firstChar === "'") && (variable[variable.length - 1] === "'"))
		) {
			return variable.substring(1, variable.length - 1)
		}
		if (firstChar === '@') {
			return parseDecorator(variable, data)
		}
		if (firstChar === '%') {
			return parseReflect(variable, data)
		}
		if (firstChar === '-') {
			blockBack ++
			return blockStack[blockStack.length - blockBack].data
		}
		if (data[variable] === undefined) {
			data = new Str(data)
		}
		let value = data[variable]
		return ((typeof value === 'function') && !value.prototype)
			? await value.call(data)
			: value
	}

	async parseVars()
	{
		let blockStart = 0
		let collection = []
		let data       = this.data
		let inHead     = false
		let iteration  = 0
		let iterations = 0

		while (index < length) {
			let char = source[index]

			// expression
			if ((char === '{') && this.doExpression) {
				await this.parseExpression(data, '}')
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

					// end condition / loop block
					if ('eE'.includes(source[index]) && ['end-->', 'END-->'].includes(source.substring(index, index + 6))) {
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

					// begin condition / loop block
					blockStack.push({ blockStart, collection, data, iteration, iterations })
					if (tagIndex > start) {
						target += this.trimEndLine(source.substring(start, tagIndex))
						start   = tagIndex
					}
					const backTarget      = target
					const backTranslating = translating
					index       = tagIndex
					target      = ''
					translating = false
					const condition = await this.parseExpression(data, '}', '-->')
					let blockData   = condition ? (target ? data : undefined) : target
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
					if (!iterations) {
						this.skipBlock()
						continue
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
				if (inHead && (closeTagName[0] === 'h') && (closeTagName === 'head')) {
					inHead = false
					if (!doHeadLinks) {
						doneLinks = headLinks
						headLinks = new SortedArray<string>
						headLinks.distinct = true
					}
				}
				let shouldTranslate = translating
				if (!this.unclosingTags.includes(closeTagName)) {
					do {
						shouldTranslate = this.closeTag(shouldTranslate, tagIndex)
					}
					while ((tagName !== closeTagName) && tagName.length)
				}
				if (shouldTranslate) {
					transLock = false
					this.translateTarget(tagIndex, (tagName[0] === 't') && (tagName === 'title'))
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
			if ((char === 'h') && (tagName === 'head')) {
				inHead = true
			}

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
						targetStack.push(target + source.substring(start, tagIndex))
					}
					else {
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
			let   hasTypeSubmit  = false
			const inInput        = (char === 'i') && (tagName === 'input')
			const inLink         = (char === 'l') && (tagName === 'link')
			const inScript       = (char === 's') && (tagName === 'script')
			let   targetTagIndex = -1
			if (inHead && (inLink || inScript)) {
				this.sourceToTarget()
				targetTagIndex = target.lastIndexOf('<')
			}
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
					if ((open === '(') && (source.substring(index, index + 6) === 'app://')) {
						this.sourceToTarget()
						index += 6
						start  = index
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
								let frontStyle = path
									.normalize(this.filePath + sep + source.substring(start, index))
									.substring(appPath.length)
								if (sep !== '/') {
									frontStyle = frontStyle.replaceAll(sep, '/')
								}
								target += frontStyle
								start = index
							}
							if (inScriptSrc && attributeValue.endsWith('.js')) {
								let frontScript = path
									.normalize(this.filePath + sep + source.substring(start, index))
									.substring(appPath.length)
								if (sep !== '/') {
									frontScript = frontScript.replaceAll(sep, '/')
								}
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
							await this.parseExpression(data, close)
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
			}

			if (targetTagIndex > -1) {
				this.sourceToTarget()
				const headLink = target.substring(targetTagIndex)
				if (!doneLinks || !doneLinks.includes(headLink)) {
					headLinks.insert(headLink)
				}
			}

			if (inScript) {
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

	skipBlock()
	{
		if (index > start) {
			this.sourceToTarget()
		}
		let depth = 1
		while (depth) {
			index = source.indexOf('<!--', index)
			if (index < 0) {
				break
			}
			index += 4
			const char = source[index]
			if (!this.startsExpression(char)) {
				continue
			}
			if ((char === 'e') && (source.substring(index, index + 6) === 'end-->')) {
				depth --
				continue
			}
			depth ++
		}
		index -= 4
		if (index < 0) {
			index = length
		}
		start = index
	}

	sourceToTarget()
	{
		target += source.substring(start, index)
		start   = index
	}

	startsExpression(char: string, open = '{', close = '}')
	{
		return RegExp('[a-z0-9"%*.?@\'' + open + close + '-]', 'i').test(char)
	}

	tr(text: string, parts?: string[])
	{
		const original = text
		text           = text.trimEnd()
		const right    = text.length
		let left       = text.length
		text           = text.trimStart()
		left          -= text.length
		text           = (parts && /^(\$[1-9][0-9]*)+$/.test(text))
			? parts.join('')
			: (text.length ? tr(text, parts?.map(part => ((typeof part)[0] === 's') ? tr(part) : part)) : text)
		return original.substring(0, left) + text + original.substring(right)
	}

	translateTarget(index: number, isTitle = false)
	{
		let translated: string
		if (translateParts.length) {
			target    += source.substring(start, index)
			translated = this.tr(target, translateParts)
			target         = (targetStack.pop() ?? '') + translated
			translateParts = []
		}
		else {
			translated = this.tr(source.substring(start, index))
			target    += translated
		}
		if (isTitle && doHeadLinks) {
			headTitle = translated
		}
		start = index
	}

	trimEndLine(string: string)
	{
		let index = string.length
		while ((index > 0) && ' \n\r\t\f'.includes(string[index - 1])) {
			index --
			if (string[index] === '\n') {
				break
			}
		}
		return string.substring(0, index)
	}

}
