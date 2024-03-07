import { readFile } from 'node:fs/promises'
import { sep }      from 'path'

const parseCsv     = require('papaparse').parse
const translations = new Map<string, string>()

readFile(__dirname + sep + 'fr.csv', 'utf-8')
	.then(data => parseCsv(data, { delimiter: ';' }).data as [string, string][])
	.then(data => data.forEach(row => translations.set(row[0], row[1])))

export const lang = 'fr'

export function tr(text: string, parts = [] as string[])
{
	let   partsCount = parts.length
	const firstChar  = text[0]
	const ucFirst    = (firstChar >= 'A') && (firstChar <= 'Z')
	text = translations.get(text)
		?? (ucFirst ? translations.get(firstChar.toLocaleLowerCase() + text.slice(1)) : undefined)
		?? translations.get(text.toLocaleLowerCase())
		?? text
	while (partsCount) {
		text = text.replaceAll('$' + partsCount, parts[--partsCount])
	}
	if (ucFirst) {
		return text[0].toLocaleUpperCase() + text.slice(1)
	}
	return text
}
