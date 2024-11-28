import fs   from 'node:fs'
import path from 'node:path'
import ts   from 'typescript'
import Type from '../class/type'

export class CollectionType<T extends object = object, PT extends object = object>
{

	constructor(public collectionType: Type<T>, public elementType: PrimitiveType | Type<PT>)
	{}

}

export type PrimitiveType = typeof BigInt | Boolean | Number | Object | String | Symbol | undefined

export type PropertyType<T extends object = object, PT extends object = object>
	= CollectionType<T, PT> | PrimitiveType | Type<PT>

export type PropertyTypes<T extends object = object> = { [property: string]: PropertyType<T> }

type TypeImports = { [name: string]: { import: string, name: string } }

export function primitiveType(type: string): PrimitiveType | Type
{
	const first = type[0]
	if (first === 'b') return (type[1] === 'i') ? typeof BigInt : Boolean
	if (first === 'n') return Number
	if (first === 'o') return Object
	if (first === 's') return (type[1] === 't') ? String : Symbol
	if (first === 'u') return undefined
	return (globalThis as any)[type] as Type
}

export function propertyTypesFromFile<T extends object = object>(file: string)
{
	const content       = fs.readFileSync(file.substring(0, file.lastIndexOf('.')) + '.d.ts', 'utf8')
	const filePath      = file.slice(0, file.lastIndexOf('/'))
	const propertyTypes = {} as PropertyTypes<T>
	const sourceFile    = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true)
	const typeImports   = {} as TypeImports

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
				if (!(ts.isPropertyDeclaration(member) && member.type)) {
					return
				}
				let collectionType: string | undefined
				let elementType:    string
				const type = member.type.getText()
				switch (type[type.length - 1]) {
					case ']':
						collectionType = 'Array'
						elementType    = type.slice(0, -2)
						break
					case '>': {
						const indexOf  = type.indexOf('<')
						collectionType = type.slice(0, indexOf)
						elementType    = type.slice(indexOf + 1, -1)
						break
					}
					default:
						elementType = type
				}
				const propertyType = stringToType(elementType, typeImports)
				propertyTypes[(member.name as ts.Identifier).text] = collectionType
					? new CollectionType(stringToType(collectionType, typeImports) as Type, propertyType)
					: propertyType
			})
			return
		}

		ts.forEachChild(node, parseNode)
	}

	parseNode(sourceFile)
	return propertyTypes
}

export function stringToType(type: string, typeImports: TypeImports): PrimitiveType | Type
{
	const typeImport = typeImports[type]
	return typeImport
		? require(typeImport.import)[typeImport.name] as Type
		: primitiveType(type)
}
