import '@itrocks/class-file/automation'

import composeConfig from './config/compose'
import compose       from '@itrocks/compose'
compose(__dirname, composeConfig)

import './orm/orm' // lazy-loading

import './action/routes' // route

import appDir                from '@itrocks/app-dir'
import { componentOf }       from '@itrocks/composition'
import { FastifyServer }     from '@itrocks/fastify'
import { FileStore }         from '@itrocks/fastify-file-session-store'
import { mysqlDependsOn }    from '@itrocks/mysql'
import { toColumn }          from '@itrocks/rename'
import { Request, Response } from '@itrocks/request-response'
import { createDataSource }  from '@itrocks/storage'
import { frontScripts }      from '@itrocks/template'
import { applyTransformer }  from '@itrocks/transformer'
import { READ, SAVE, SQL }   from '@itrocks/transformer'
import { trInit }            from '@itrocks/translate'
import dataSourceConfig      from '../local/data-source'
import secret                from '../local/secret'
import sessionConfig         from '../local/session'
import Action                from './action/action'
import Exception             from './action/exception'
import { needOf }            from './action/need'
import ActionRequest         from './action/request'
import { getActionModule }   from './action/routes'
import staticRoutes          from './action/static-routes'
import                            './class/collection'
import access                from './config/access'
import DaoFunction           from './dao/functions'
import { storeOf }           from './dao/store'
import { PROTECT_GET }       from './orm/orm'
import { IGNORE }            from './property/transform/password'
import                            './property/transform/primitive'
import                            './view/html/transformer'

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

trInit('fr-FR', appDir + '/app/locale/fr-FR.csv')

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

createDataSource(dataSourceConfig)

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
