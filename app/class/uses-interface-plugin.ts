import ts from 'typescript'

class UpdateOptions {
	createImports    = new Map<string, { default: boolean, path: string }>
	updateClasses    = new Set<string>
	createExport     = ''
	createInterfaces = new Map<string, string[]>
}

let updateDeclarations = new Map<string, UpdateOptions>

function usesDecoratorValues(node: ts.ClassDeclaration & ts.HasDecorators)
{
	const mixins: string[] = []
	for (const decorator of ts.getDecorators(node) ?? []) {
		if (!ts.isCallExpression(decorator.expression)) continue
		if (decorator.expression.expression.getText() !== 'Uses') continue
		for (const argument of decorator.expression.arguments) {
			if (!ts.isIdentifier(argument)) continue
			mixins.push(argument.text)
		}
	}
	return mixins
}

export default () => function transformer(context: ts.TransformationContext)
{
	const {factory} = context

	function createExport(className: string)
	{
		return factory.createExportAssignment(undefined, undefined, factory.createIdentifier(className))
	}

	function createInterface(node: ts.ClassDeclaration, className: string, mixins: string[])
	{
		const modifiers: ts.ModifierLike[] = []
		if (node.modifiers?.some(modifier => (modifier.kind === ts.SyntaxKind.ExportKeyword))) {
			modifiers.push(factory.createModifier(ts.SyntaxKind.ExportKeyword))
		}

		const interfaceName = factory.createIdentifier(className)

		const heritageClause = factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, mixins.map(
			mixin => factory.createExpressionWithTypeArguments(factory.createIdentifier(mixin), undefined)
		))

		return factory.createInterfaceDeclaration(modifiers, interfaceName, undefined, [heritageClause], [])
	}

	function updateClass(node: ts.ClassDeclaration)
	{
		const modifiers: ts.ModifierLike[] = node.modifiers?.filter(
			modifier => (modifier.kind !== ts.SyntaxKind.DefaultKeyword)
		) ?? []
		modifiers.push(factory.createModifier(ts.SyntaxKind.DeclareKeyword))

		return factory.updateClassDeclaration(
			node, modifiers, node.name, node.typeParameters, node.heritageClauses, node.members
		)
	}

	function visitSourceFile(sourceFile: ts.SourceFile)
	{
		const imports           = new Map<string, { default: boolean, path: string }>
		const updateOptions     = new UpdateOptions
		const alreadyInterfaces = new Set<string>

		function visit(node: ts.Node)
		{
			if (ts.isImportDeclaration(node) && node.importClause && node.moduleSpecifier) {
				const importPath    = (node.moduleSpecifier as ts.StringLiteral).text
				const namedBindings = node.importClause.namedBindings
				const name          = node.importClause.name
				if (name) {
					imports.set(name.text, { default: true, path: importPath })
				}
				if (namedBindings && ts.isNamedImports(namedBindings)) {
					namedBindings.elements.forEach(element => {
						imports.set(element.name.text, { default: false, path: importPath })
					})
				}
				return node
			}

			if (ts.isClassDeclaration(node)) {
				let className: string | undefined
				let mixins:    string[]

				if (
					!(className = node.name?.text)
					|| !ts.canHaveDecorators(node)
					|| !(mixins = usesDecoratorValues(node)).length
				) {
					return node
				}

				const isDefault = node.modifiers?.some(modifier => (modifier.kind === ts.SyntaxKind.DefaultKeyword))

				if (isDefault) {
					updateOptions.updateClasses.add(className)
				}
				if (!alreadyInterfaces.has(className)) {
					updateOptions.createInterfaces.set(className, mixins)
					for (const mixin of mixins) {
						const importOptions = imports.get(mixin)
						if (importOptions) {
							updateOptions.createImports.set(mixin, importOptions)
						}
					}
				}
				if (isDefault) {
					updateOptions.createExport = className
				}
				updateDeclarations.set(sourceFile.fileName, updateOptions)

				return node
			}

			if (ts.isInterfaceDeclaration(node)) {
				const className = node.name?.text
				if (className && node.modifiers?.some(modifier => (modifier.kind === ts.SyntaxKind.ExportKeyword))) {
					alreadyInterfaces.add(className)
					updateOptions.createInterfaces.delete(className)
				}

				return node
			}

			return ts.visitEachChild(node, visit, context)
		}

		return ts.visitNode(sourceFile, visit)
	}

	function visitDeclarationFile(sourceFile: ts.SourceFile)
	{
		const updateOptions = updateDeclarations.get(sourceFile.fileName)
		if (!updateOptions) return sourceFile

		let doneImports = false
		const imports   = new Set<string>

		function visit(node: ts.Node)
		{
			if (ts.isSourceFile(node)) return ts.visitEachChild(node, visit, context)

			if (ts.isImportDeclaration(node)) {
				if (node.importClause && node.moduleSpecifier) {
					const namedBindings = node.importClause.namedBindings
					const name          = node.importClause.name
					if (name) imports.add(name.text)
					if (namedBindings && ts.isNamedImports(namedBindings)) {
						namedBindings.elements.forEach(element => imports.add(element.name.text))
					}
					return node
				}
				return node
			}

			const nodes   = new Array<ts.Statement>
			const options = updateOptions as UpdateOptions

			if (!doneImports) {
				doneImports = true
				options.createImports.forEach((importOptions, mixin) => {
					if (imports.has(mixin)) return
					nodes.push(factory.createImportDeclaration(
						undefined,
						factory.createImportClause(
							false,
							importOptions.default ? factory.createIdentifier(mixin) : undefined,
							importOptions.default ? undefined : factory.createNamedImports([
								factory.createImportSpecifier(false, undefined, factory.createIdentifier(mixin))
							])
						),
						factory.createStringLiteral(importOptions.path)
					))
				})
			}

			if (ts.isClassDeclaration(node)) {
				const className = node.name?.text
				if (className) {
					nodes.push(options.updateClasses.has(className) ? updateClass(node) : node )
					const mixins = options.createInterfaces.get(className)
					if (mixins?.length) {
						nodes.push(createInterface(node as ts.ClassDeclaration, className, mixins))
					}
					if (options.createExport) {
						nodes.push(createExport(className))
					}
				}
			}

			return (nodes.length) ? [...nodes] : node
		}

		const result = ts.visitNode(sourceFile, visit)
		updateDeclarations.delete(sourceFile.fileName)
		return result
	}

	return (sourceFile: ts.SourceFile) => sourceFile.isDeclarationFile
		? visitDeclarationFile(sourceFile)
		: visitSourceFile(sourceFile)
}
