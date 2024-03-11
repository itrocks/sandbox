import { readdir } from 'node:fs/promises'
import { sep }     from 'path'

const walk = async (directoryName: string): Promise<string[]> =>
{
	// @ts-ignore flat(Infinity) always returns string[]
	return Promise.all(
		await readdir(directoryName, { withFileTypes: true }).then(entries =>
			entries.map(entry => {
				const child = directoryName + sep + entry.name
				return entry.isDirectory() ? walk(child) : child
			})
		)
	)
	.then(entries => entries.flat(Infinity))
}

const readDirRecursive = async (directoryName: string) =>
	walk(directoryName)
	.then(entries => entries.map(entry => entry.substring(directoryName.length)))

export function getModule(ofRoute: string)
{
	let route: Routes | string = routes
	for (const name of ofRoute.substring(1).split('/').reverse()) {
		if (typeof route === 'string') return undefined
		const routeStep = route[name] as Routes | string | undefined
		if (!routeStep) break
		route = routeStep
	}
	if ((typeof route === 'object') && route[':']) {
		route = route[':']
	}
	return (route === routes) ? undefined : route
}

export function getRoute(ofModule: string)
{
	let route: Routes | string = routes
	for (const name of ofModule.substring(1).split('/').reverse()) {
		if (typeof route === 'string') return route
		const routeStep = route[name] as Routes | string | undefined
		if (!routeStep) break
		route = routeStep
	}
	if ((typeof route === 'object') && route[':']) {
		route = route[':']
	}
	return (typeof route === 'string') ? route : undefined
}

export type Routes = { [name: string]: Routes | string }

export const routes = {} as Routes

readDirRecursive(__dirname.substring(0, __dirname.lastIndexOf(sep))).then(entries => {
	for (let entry of entries) {
		if (!entry.endsWith('.ts') || entry.endsWith('.d.ts') || entry.endsWith('.test.ts')) continue
		entry = entry.substring(0, entry.length - 3)
		let   route  = routes
		const names  = entry.split(sep).slice(1).reverse()
		const length = names.length - 1
		for (let index = 0; index < length; index ++) {
			const name      = names[index]
			let   routeStep = route[name]
			if (!routeStep) {
				routeStep = {}
			}
			if (typeof routeStep === 'string') {
				routeStep = { ':': routeStep }
			}
			route = route[name] = routeStep
		}
		const name = names[names.length - 1]
		route[name]
			? Object.assign(route[name], { ':': entry })
			: (route[name] = entry)
	}
	const simplify = (routes: Routes, name: string, route: Routes | string) => {
		if (typeof route === 'string') {
			return
		}
		for (const [name, subRoutes] of Object.entries(route)) simplify(route, name, subRoutes)
		const values = Object.values(route)
		if (values.length === 1) {
			routes[name] = values[0]
			return
		}
	}
	for (const [name, route] of Object.entries(routes)) simplify(routes, name, route)
})
