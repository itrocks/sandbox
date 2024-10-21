import fs   from 'node:fs'
import path from 'node:path'
import ts   from 'typescript'
import Type from '../class/type'

export type PrimitiveType = typeof BigInt | Boolean | Number | Object | String | Symbol | undefined

export type PropertyTypes = { [property: string]: PrimitiveType | Type }

export function propertyTypesFromFile(file: string)
{
	const content       = fs.readFileSync(file.substring(0, file.lastIndexOf('.')) + '.d.ts', 'utf8')
	const filePath      = file.slice(0, file.lastIndexOf('/'))
	const propertyTypes = {} as PropertyTypes
	const sourceFile    = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true)
	const typeImports   = {} as { [name: string]: { import: string, name: string } }

	const parseNode = (node: ts.Node) => {

		if (ts.isImportDeclaration(node) && node.importClause) {
			const importFile = path.normalize(filePath + '/' + (node.moduleSpecifier as ts.StringLiteral).text)
			if (node.importClause.name) {
				typeImports[node.importClause.name.getText()] = { import: importFile, name: 'default' }
			}
			if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
				for (const importSpecifier of node.importClause.namedBindings.elements) {
					const name  = importSpecifier.name.getText()
					const alias = importSpecifier.propertyName?.getText() ?? name
					typeImports[alias] = { import: importFile, name }
				}
			}
		}

		if (ts.isClassDeclaration(node)) {
			node.members.forEach(member =>
			{
				if (ts.isPropertyDeclaration(member) && member.type) {
					const type = member.type.getText()
					let propertyType: PrimitiveType | Type
					const typeImport = typeImports[type]
					propertyType = typeImport
						? require(typeImport.import)[typeImport.name] as Type
						: (globalThis as any)[type]
					propertyTypes[(member.name as ts.Identifier).text] = propertyType
				}
			})
			return
		}

		ts.forEachChild(node, parseNode)
		return
	}

	parseNode(sourceFile)
	return propertyTypes
}
