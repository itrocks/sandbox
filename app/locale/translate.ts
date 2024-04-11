import { readFile } from 'node:fs/promises'
import { sep }      from 'path'

const parseCsv     = require('papaparse').parse

const expressions  = new Set<RegExp>
const translations = new Map<string, string>

readFile(__dirname + sep + 'fr.csv', 'utf-8')
	.then(data => parseCsv(data, { delimiter: ';' }).data as [string, string][])
	.then(data => data.forEach(row => {
		translations.set(row[0], row[1])
		if (row[0].includes('$')) {
			expressions.add(new RegExp('^' + row[0].replace(/(\$[0-9]+)/, '(.*)') + '$'))
		}
	}))

export const lang = 'fr'

export function tr(text: string, parts = [] as string[])
{
	let   partsCount = parts.length
	const firstChar  = text[0]
	const ucFirst    = (firstChar >= 'A') && (firstChar <= 'Z')
	text = translations.get(text)
		?? (ucFirst ? translations.get(firstChar.toLocaleLowerCase() + text.slice(1)) : undefined)
		?? translations.get(text.toLocaleLowerCase())
		?? trMatch(text, parts)
	while (partsCount) {
		text = text.replaceAll('$' + partsCount, parts[--partsCount])
	}
	if (ucFirst) {
		return text[0].toLocaleUpperCase() + text.slice(1)
	}
	return text
}

function trMatch(text: string, parts: string[])
{
	for (const expression of expressions) {
		const match = text.match(expression)
		if (!match) continue
		let   counter      = parts.length
		const replacements = []
		const trParts      = [...parts]
		for (const part of match.slice(1)) {
			const translatedPart = tr(part)
			trParts.push(translatedPart[0].toLocaleLowerCase() + translatedPart.slice(1))
			replacements.push('$' + trParts.length)
		}
		const trText = expression.source.slice(1, -1).replaceAll('(.*)', () => '$' + ++counter)
		return tr(trText, trParts)
	}
	return text
}
