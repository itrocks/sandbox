import { readFileSync }  from 'node:fs'
import { writeFileSync } from 'node:fs'
import path              from 'path'
import ts                from 'typescript'

// TODO support aliasing: import { Route as Alias } from './route' ; @Alias('/')

const staticRoutesFile = __dirname + '/static-routes.json'

const routes  = JSON.parse(readFileSync(staticRoutesFile).toString()) as { [path: string]: string }
const modules = {} as { [module: string]: string[] }
for (const [path, module] of Object.entries(routes)) {
	(modules[module] ?? (modules[module] = [])).push(path)
}

const saveStaticRoutes = () => writeFileSync(staticRoutesFile, JSON.stringify(routes, null, '\t') + '\n')

const transformer = (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) =>
{
	let   hasRoute    = false
	const validRoutes = {} as { [path: string]: string }

	const rootLength = path.normalize(__dirname + '/..').length
	const module     = sourceFile.fileName.slice(rootLength, -3)

	function isRoute(node: ts.Node): boolean
	{
		if (!ts.isImportDeclaration(node)) return false
		if (!node.importClause) return false
		if (!(node.moduleSpecifier as ts.StringLiteral).text.endsWith('/route')) return false

		const fileName   = sourceFile.fileName
		const filePath   = fileName.slice(0, fileName.lastIndexOf('/'))
		const modulePath = path.normalize(filePath + '/' + (node.moduleSpecifier as ts.StringLiteral).text)
		if (modulePath !== __dirname + '/route') return false

		if (node.importClause.name?.getText() === 'Route') {
			return true
		}

		const namedBindings = node.importClause.namedBindings
		if (!namedBindings || !ts.isNamedImports(namedBindings)) return false
		for (const importSpecifier of namedBindings.elements) {
			if (importSpecifier.name.getText() === 'Route') {
				return true
			}
		}

		return false
	}

	function routeDecoratorValues(node: ts.Node)
	{
		const values = []
		if (!ts.canHaveDecorators(node)) return []
		for (const decorator of ts.getDecorators(node) ?? []) {
			if (!ts.isCallExpression(decorator.expression)) continue
			if (decorator.expression.expression.getText() !== 'Route') continue
			const argument = decorator.expression.arguments[0]
			if (!argument || !ts.isStringLiteral(argument)) continue
			values.push(argument.text)
		}
		return values
	}

	function visit(node: ts.Node): ts.Node
	{
		if (hasRoute ||= isRoute(node)) {
			for (const path of routeDecoratorValues(node)) {
				if (path) {
					validRoutes[path] = module
					if (module !== routes[path]) {
						if (routes[path]) {
							const moduleRoutes = modules[routes[path]]
							delete moduleRoutes[moduleRoutes.indexOf(path)]
						}
						(modules[module] ?? (modules[module] = [])).push(path)
						routes[path] = module
					}
				}
			}
		}
		return ts.visitEachChild(node, visit, context)
	}

	const resultNode = ts.visitNode(sourceFile, visit)

	const moduleRoutes = modules[module]
	if (moduleRoutes) {
		let deletions = 0
		for (const path of moduleRoutes) {
			if (validRoutes[path]) continue
			delete moduleRoutes[moduleRoutes.indexOf(path)]
			delete routes[path]
			deletions ++
		}
		if (deletions) {
			modules[module] = moduleRoutes.filter(path => path)
			if (!modules[module].length) {
				delete modules[module]
			}
			saveStaticRoutes()
		}
		else if (Object.keys(validRoutes).length) {
			saveStaticRoutes()
		}
	}

	return resultNode
}

export default () => { return { before: [transformer] } }