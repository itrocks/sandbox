import { baseType, isAnyType } from '@itrocks/class-type'
import { access, readdir }     from 'fs/promises'
import { normalize, sep }      from 'path'
import { Route }               from './route'

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
	walk(directoryName).then(entries => entries.map(entry => entry.slice(directoryName.length)))

export async function accessModule(path: string)
{
	try { await access('./app' + path + '.js') }
	catch { return }
	return path
}

function addRoute(routePath: string, moduleFile: string)
{
	let   route  = routes
	const names  = routePath.split(sep).slice(1).reverse()
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
		? Object.assign(route[name], { ':': moduleFile })
		: (route[name] = moduleFile)
}

export async function getActionModule(ofRoute: string, action: string)
{
	const module = getModule(ofRoute)
	return await accessModule(module + '/' + action)
		|| await accessModule('/action/builtIn/' + action + '/' + action)
		|| ''
}

export function getModule(ofRoute: string)
{
	let route: Routes | string = routes
	for (const name of ofRoute.slice(1).split('/').reverse()) {
		if (typeof route === 'string') return route
		const routeStep: Routes | string | undefined = route[name]
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
	const getRoute = ['']
	let route: Routes | string = routes
	for (const name of ofModule.slice((ofModule[1] === ':') ? 3 : 1).split(sep).reverse()) {
		if (typeof route === 'string') return getRoute.join('/')
		const routeStep: Routes | string | undefined = route[name]
		if (!routeStep) break
		getRoute.push(name)
		route = routeStep
	}
	if ((typeof route === 'object') && route[':']) {
		route = route[':']
	}
	return (typeof route === 'string') ? getRoute.join('/') : undefined
}

type Routes = { [name: string]: Routes | string }

const routes: Routes = {}

readDirRecursive(__dirname.slice(0, __dirname.lastIndexOf(sep))).then(entries => {
	for (let entry of entries) {
		if (!entry.endsWith('.js') || entry.endsWith('.test.js')) continue
		entry = entry.slice(0, -3)
		addRoute(entry, entry)
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

const Module = require('module')
const superRequire: (...args: any) => typeof Module = Module.prototype.require

Module.prototype.require = function(file: string)
{
	const module = superRequire.call(this, ...arguments)
	const type   = module?.default
	if (!type || !isAnyType(type)) return module

	if (file[0] === '.') {
		file = this.path + ((this.path[this.path.length - 1] === '/') ? '' : '/') + file
	}
	file = normalize(require.resolve(file))
	if (file[0] !== '/') return module

	const realType = baseType(type)
	const route    = getRoute(file.slice(0, -3))
	if (!route) return module

	Route(route)(realType)

	return module
}
