import { readFileSync } from 'fs'
import {
	createSourceFile, forEachChild, Identifier, isClassDeclaration, isPropertyDeclaration, Node, ScriptTarget
} from 'typescript'

export type PropertyTypes = { [index: string]: string }

export function propertyTypesFromFile(file: string)
{
	const content       = readFileSync(file.substring(0, file.lastIndexOf('.')) + '.d.ts', 'utf8')
	const propertyTypes = {} as PropertyTypes
	const sourceFile    = createSourceFile(file, content, ScriptTarget.Latest, true)
	const parseNode     = (node: Node) => {
		if (!isClassDeclaration(node)) {
			forEachChild(node, parseNode)
			return
		}
		node.members.forEach(member => {
			if (isPropertyDeclaration(member) && member.type) {
				propertyTypes[(member.name as Identifier).text] = member.type.getText()
			}
		})
	}
	parseNode(sourceFile)
	return propertyTypes
}
