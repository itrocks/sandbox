import { readdir } from 'node:fs/promises'
import path        from 'path'

const walk = async (path: string): Promise<string[]> =>
{
	// @ts-ignore flat(Infinity) always returns string[]
	return Promise.all(
		await readdir(path, {withFileTypes: true}).then(entries =>
			entries.map(entry => {
				const child = path + '/' + entry.name
				return entry.isDirectory() ? walk(child) : child
			})
		)
	)
	.then(entries => entries.flat(Infinity))
}

const readDirRecursive = async (path: string): Promise<string[]> =>
	walk(path)
	.then(entries => entries.map(entry => entry.substring(path.length)))

export const routes: { [name: string]: any } = {}
export default routes

readDirRecursive(__dirname.substring(0, __dirname.lastIndexOf(path.sep))).then(entries => {
	entries.forEach(entry => {
		if (!entry.endsWith('.ts')) {
			return
		}
		entry = entry.substring(0, entry.length - 3)
		let route = routes
		const names = entry.split('/').slice(1).reverse()
		names.slice(0, names.length - 1).forEach(name => {
			if (!route[name]) {
				route[name] = {}
			}
			if (typeof route[name] === 'string') {
				route[name] = { ':': route[name] }
			}
			route = route[name]
		})
		let name = names[names.length - 1]
		if (route[name]) {
			route[name][':'] = entry
		}
		else {
			route[name] = entry
		}
	})
	const simplify = (
		routes: { [name: string]: any },
		name: string,
		route: { [name: string]: any }|string
	) => {
		if (typeof route === 'string') {
			return
		}
		Object.entries(route).forEach(([name, subRoutes]) => simplify(route, name, subRoutes))
		if (Object.values(route).length === 1) {
			routes[name] = Object.values(route)[0]
			return
		}
	}
	Object.entries(routes).forEach(([name, route]) => simplify(routes, name, route))
})
