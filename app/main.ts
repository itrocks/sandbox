import '@itrocks/class-file/automation'

import composeConfig from './config/compose'
import compose       from '@itrocks/compose'
compose(__dirname, composeConfig)

import { initLazyLoading } from '@itrocks/lazy-loading'
initLazyLoading()

import { initRoutes } from '@itrocks/route'
initRoutes()

import { Action }                   from '@itrocks/action'
import { needOf }                   from '@itrocks/action'
import { Request as ActionRequest } from '@itrocks/action'
import { requestDependsOn }         from '@itrocks/action'
import appDir                       from '@itrocks/app-dir'
import { classViewDependsOn }       from '@itrocks/class-view'
import { representativeValueOf }    from '@itrocks/class-view'
import { initCollection }           from '@itrocks/collection'
import { componentOf }              from '@itrocks/composition'
import { initCoreTransformers }     from '@itrocks/core-transformers'
import { FastifyServer }            from '@itrocks/fastify'
import { FileStore }                from '@itrocks/fastify-file-session-store'
import { PROTECT_GET }              from '@itrocks/lazy-loading'
import { mysqlDependsOn }           from '@itrocks/mysql'
import { displayOf }                from '@itrocks/property-view'
import { toColumn }                 from '@itrocks/rename'
import { Headers }                  from '@itrocks/request-response'
import { Request, Response }        from '@itrocks/request-response'
import { routeOf }                  from '@itrocks/route'
import { getActionModule }          from '@itrocks/route'
import { getModule }                from '@itrocks/route'
import { staticRoutes }             from '@itrocks/route'
import { createDataSource }         from '@itrocks/storage'
import { storeDependsOn }           from '@itrocks/store'
import { storeOf }                  from '@itrocks/store'
import { frontScripts }             from '@itrocks/template'
import { applyTransformer }         from '@itrocks/transformer'
import { READ, SAVE, SQL }          from '@itrocks/transformer'
import { tr, trInit }               from '@itrocks/translate'
import { format, parse }            from 'date-fns'
import dataSourceConfig             from '../local/data-source'
import secret                       from '../local/secret'
import sessionConfig                from '../local/session'
import Exception                    from './action/exception'
import access                       from './config/access'
import DaoFunction                  from './dao/functions'
import { IGNORE }                   from './property/transform/password'
import { requiredOf }               from './property/validate/required'
import Template                     from './view/html/template'

frontScripts.push(
	'/node_modules/@itrocks/build/build.js',
	'/node_modules/@itrocks/form-fetch/form-fetch.js',
	'/node_modules/@itrocks/plugin/plugin.js',
	'/node_modules/@itrocks/table/freeze.js',
	'/node_modules/@itrocks/table/freeze/inherit-background.js',
	'/node_modules/@itrocks/table/freeze/inherit-border.js',
	'/node_modules/@itrocks/table/table.js',
	'/node_modules/@itrocks/xtarget/begin-end.js',
	'/node_modules/@itrocks/xtarget/build.js',
	'/node_modules/@itrocks/xtarget/composite.js',
	'/node_modules/@itrocks/xtarget/default-target.js',
	'/node_modules/@itrocks/xtarget/head.js',
	'/node_modules/@itrocks/xtarget/headers-size.js',
	'/node_modules/@itrocks/xtarget/history.js',
	'/node_modules/@itrocks/xtarget/modifier.js',
	'/node_modules/@itrocks/xtarget/xtarget.js',
	'/node_modules/@itrocks/sorted-array/sorted-array.js',
	'/node_modules/air-datepicker/air-datepicker.js',
	'/node_modules/air-datepicker/locale/en.js',
	'/node_modules/air-datepicker/locale/fr.js',
	'/node_modules/autocompleter/autocomplete.es.js'
)

classViewDependsOn({ requiredOf, tr })

createDataSource(dataSourceConfig)

initCollection()

initCoreTransformers({
	displayOf,
	formatDate:             date => format(date, tr('dd/MM/yyyy', { ucFirst: false })),
	ignoreTransformedValue: IGNORE,
	parseDate:              date => parse(date, tr('dd/MM/yyyy', { ucFirst: false }), new Date),
	representativeValueOf,
	routeOf,
	tr
})

mysqlDependsOn({
	applyReadTransformer: async function(data, property, object) {
		return applyTransformer(data[property], object, property, SQL, READ, data)
	},
	applySaveTransformer: async function(object, property, data) {
		const value = Reflect.getMetadata(PROTECT_GET, object, property) ? undefined : await object[property]
		return applyTransformer(value, object, property, SQL, SAVE, data)
	},
	columnOf:               toColumn,
	componentOf:            componentOf,
	ignoreTransformedValue: IGNORE,
	QueryFunction:          DaoFunction,
	queryFunctionCall:      value => [value.value, value.sql],
	storeOf:                storeOf
})

requestDependsOn({ getModule: route => {
	const module = getModule(route)
	return module ? (appDir + '/app' + module) : module
}})

storeDependsOn({ toStoreName: toColumn })

trInit('fr-FR', appDir + '/app/locale/fr-FR.csv')

Action.prototype.htmlTemplateResponse = async function(
	data: any, request: ActionRequest, templateFile: string, statusCode = 200, headers: Headers = {}
) {
	const template    = new Template(data, { action: request.action, request, session: request.request.session })
	template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
	return this.htmlResponse(
		await template.parseFile(templateFile, appDir + '/app/home/container.html'), statusCode, headers
	)
}

async function execute(request: ActionRequest)
{
	let action: Action & Record<string, (request: ActionRequest) => Promise<Response>>
	let staticRoute = staticRoutes[request.request.path]
	if (staticRoute) {
		const position = staticRoute.lastIndexOf('/')
		request.route  = staticRoute.slice(0, position)
		request.action = staticRoute.slice(position + 1)
		request.format = request.request.headers['accept'].split(',')[0].split('/')[1]
		if (request.format === '*') {
			request.format = 'html'
		}
	}
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	if (!request.request.session.user && !access.free.includes(request.route + '/' + request.action)) {
		request.action = 'login'
		request.route  = '/user'
		staticRoute    = undefined
	}
	try {
		action = new (require('.' + (staticRoute ?? await getActionModule(request.route, request.action))).default)
	} catch (exception) {
		console.error(exception)
		throw new Exception('Action ' + request.action + ' not found')
	}
	if (!action[request.format]) {
		throw new Exception('Action ' + request.action + ' unavailable in format ' + request.format)
	}
	const need    = needOf(action)
	const objects = storeOf(request.type) ? await request.getObjects() : []
	if (need.alternative && (need.alternative !== request.action) && (
		((need.need === 'object') && !objects.length)
		|| ((need.need === 'Store') && !storeOf(request.type))
	)) {
		request.action = need.alternative
		return execute(request)
	}
	if ((need.need === 'object') && !objects.length && !request.request.data.confirm) {
		throw new Exception('Action ' + request.action + ' needs an object')
	}
	return action[request.format](request)
}

new FastifyServer({
	assetPath: appDir,
	execute: async (request: Request) => execute(new ActionRequest(request)),
	favicon: '/app/style/2020/logo/favicon.ico',
	frontScripts,
	port: 3000,
	secret,
	store: new FileStore(sessionConfig.path)
}).run()
