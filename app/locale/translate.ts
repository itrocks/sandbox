import { readFile } from 'node:fs/promises'
import path         from 'path'

const parseCsv = require('papaparse').parse
const translations: Map<string, string> = new Map()

readFile(__dirname + path.sep + 'fr.csv', 'utf-8')
	.then(data => parseCsv(data, { delimiter: ';' }).data as [string, string][])
	.then(data => data.forEach(row => translations.set(row[0], row[1])))

export function tr(text: string, parts: string[])
{
	let   partsCount = parts.length
	const firstChar  = text[0]
	const ucFirst    = (firstChar >= 'A') && (firstChar <= 'Z')
	text = translations.get(text)
		?? (ucFirst ? translations.get(firstChar.toLowerCase() + text.slice(1)) : undefined)
		?? translations.get(text.toLowerCase())
		?? text
	while (partsCount) {
		text = text.replaceAll('$' + partsCount, parts[--partsCount])
	}
	if (ucFirst) {
		return text[0].toUpperCase() + text.slice(1)
	}
	return text
}
