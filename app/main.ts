import '@itrocks/class-file/automation'

import composeConfig from './config/compose'
import compose       from '@itrocks/compose'
compose(__dirname, composeConfig)

import { initLazyLoading } from '@itrocks/lazy-loading'
initLazyLoading()

import { Action, setAction }       from '@itrocks/action'
import { setActionCss }            from '@itrocks/action'
import { setActionTemplates }      from '@itrocks/action'
import { needOf }                  from '@itrocks/action'
import { Request }                 from '@itrocks/action-request'
import { actionRequestDependsOn }  from '@itrocks/action-request'
import appDir                      from '@itrocks/app-dir'
import { fileOf }                  from '@itrocks/class-file'
import { isAnyType, Type }         from '@itrocks/class-type'
import { classViewDependsOn }      from '@itrocks/class-view'
import { representativeValueOf }   from '@itrocks/class-view'
import { initCollection }          from '@itrocks/collection'
import { componentOf }             from '@itrocks/composition'
import { initCoreTransformers }    from '@itrocks/core-transformers'
import { initStoreTransformers }   from '@itrocks/core-transformers'
import { FastifyServer }           from '@itrocks/fastify'
import { FileStore }               from '@itrocks/fastify-file-session-store'
import { PROTECT_GET }             from '@itrocks/lazy-loading'
import { mysqlDependsOn }          from '@itrocks/mysql'
import { passwordDependsOn }       from '@itrocks/password'
import { setPasswordTransformers } from '@itrocks/password/transformers'
import { displayOf }               from '@itrocks/property-view'
import { toColumn }                from '@itrocks/rename'
import { Headers, Response }       from '@itrocks/request-response'
import { requiredOf }              from '@itrocks/required'
import { loadRoutes }              from '@itrocks/route'
import { routeDependsOn }          from '@itrocks/route'
import { routeOf, Routes }         from '@itrocks/route'
import DaoFunction                 from '@itrocks/sql-functions'
import { createDataSource }        from '@itrocks/storage'
import { storeDependsOn }          from '@itrocks/store'
import { storeOf }                 from '@itrocks/store'
import { frontScripts }            from '@itrocks/template'
import { applyTransformer }        from '@itrocks/transformer'
import { IGNORE }                  from '@itrocks/transformer'
import { READ, SAVE, SQL }         from '@itrocks/transformer'
import { tr, trInit }              from '@itrocks/translate'
import { format, parse }           from 'date-fns'
import dataSourceConfig            from '../local/data-source'
import secret                      from '../local/secret'
import sessionConfig               from '../local/session'
import Exception                   from './action/exception'
import access                      from './config/access'
import Template                    from './view/html/template'

frontScripts.push(
	'/node_modules/@itrocks/air-datepicker/air-datepicker.js',
	'/node_modules/@itrocks/asset-loader/asset-loader.js',
	'/node_modules/@itrocks/asset-loader/load-css.js',
	'/node_modules/@itrocks/asset-loader/load-script.js',
	'/node_modules/@itrocks/auto-focus/auto-focus.js',
	'/node_modules/@itrocks/auto-redirect/auto-redirect.js',
	'/node_modules/@itrocks/auto-redirect/build.js',
	'/node_modules/@itrocks/autocompleter/autocompleter.js',
	'/node_modules/@itrocks/breadcrumb/breadcrumb.js',
	'/node_modules/@itrocks/build/build.js',
	'/node_modules/@itrocks/collapse/collapse.js',
	'/node_modules/@itrocks/contained-auto-width/contained-auto-width.js',
	'/node_modules/@itrocks/form-fetch/form-fetch.js',
	'/node_modules/@itrocks/modal/modal.js',
	'/node_modules/@itrocks/notifications/notifications.js',
	'/node_modules/@itrocks/plugin/plugin.js',
	'/node_modules/@itrocks/real-viewport-height/real-viewport-height.js',
	'/node_modules/@itrocks/sorted-array/sorted-array.js',
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
	'/node_modules/@itrocks/xtarget/main-target.js',
	'/node_modules/@itrocks/xtarget/modifier.js',
	'/node_modules/@itrocks/xtarget/xtarget.js',
	'/node_modules/air-datepicker/air-datepicker.js',
	'/node_modules/air-datepicker/locale/en.js',
	'/node_modules/air-datepicker/locale/fr.js',
	'/node_modules/autocompleter/autocomplete.es.js'
)

setActionCss(
	{ css: '/node_modules/@itrocks/(action)/css/action.css' }
)
setActionTemplates(
	{ need: 'object', template: __dirname + '/../node_modules/@itrocks/action/cjs/selectionAction.html' },
	{ template: __dirname + '/../node_modules/@itrocks/action/cjs/action.html' }
)
setAction('edit',   'save')
setAction('edit',   'delete')
setAction('login',  'forgot-password')
setAction('login',  'register')
setAction('list',   'new')
setAction('list',   'delete', { need: 'object' })
setAction('output', 'edit')
setAction('output', 'print', { target: undefined } )
setAction('output', 'delete')
setAction('new',    'save')

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
		const value = await applyTransformer(data[property], object, property, SQL, READ, data)
		if ((value !== IGNORE) && Reflect.getOwnMetadata(PROTECT_GET, object, property)) {
			Reflect.deleteMetadata(PROTECT_GET, object, property)
		}
		return value
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

passwordDependsOn({
	setTransformers: setPasswordTransformers
})

routeDependsOn({
	calculate: (target: Type) => routes.summarize(fileOf(target).slice(appDir.length, -3))
})

storeDependsOn({
	setTransformers: initStoreTransformers,
	toStoreName:     toColumn
})

trInit('fr-FR', appDir + '/app/locale/fr-FR.csv')

type ActionObject   = Record<string, ActionFunction>
type ActionFunction = (request: Request) => Promise<Response>

Action.prototype.htmlTemplateResponse = async function(
	data: any, request: Request, templateFile: string, statusCode = 200, headers: Headers = {}
) {
	const containerData = {
		action:  request.action,
		actions: this.actions,
		request,
		session: request.request.session
	}
	const template = new Template(data, containerData)
	template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
	return this.htmlResponse(
		await template.parseFile(templateFile, appDir + '/node_modules/@itrocks/home/cjs/container.html'),
		statusCode,
		headers
	)
}

let routes: Routes

async function execute(request: Request): Promise<Response>
{
	// Access control
	if (!request.request.session.user && !access.free.includes(request.route + '/' + request.action)) {
		request.action = 'login'
		request.route  = '/user'
	}

	// Resolve action class or function module
	const module = routes.resolve(request.route + '/' + request.action)

	// undefined module
	if (!module) {
		console.error('Action ' + request.route + '/' + request.action + ' not found')
		throw new Exception('Action ' + request.route + '/' + request.action + ' not found')
	}

	// ActionClass module
	if (isAnyType(module)) {
		const action = (new module) as ActionObject
		if (request.format in action) {
			const need = needOf(action)
			if (
				need.alternative
				&& (need.alternative !== request.action)
				&& (
					((need.need === 'object') && !request.ids.length)
					|| ((need.need === 'Store') && !storeOf(request.type))
				)
			) {
				request.action = need.alternative
				return execute(request)
			}
			if ((need.need === 'object') && !request.ids.length && !request.request.data.confirm) {
				console.error('Action ' + request.route + '/' + request.action + ' needs at least one object')
				throw new Exception('Action ' + request.route + '/' + request.action + ' needs at least one ')
			}
			return action[request.format](request)
		}
	}

	// ActionFunction module
	return module(request)
}

async function main()
{
	routes = await loadRoutes()
	actionRequestDependsOn({ getModule: routes.resolve.bind(routes) })
	return new FastifyServer({
		assetPath: appDir,
		execute:   request => execute(new Request(request)),
		favicon:   '/app/style/2020/logo/favicon.ico',
		frontScripts,
		port: 3000,
		secret,
		store: new FileStore(sessionConfig.path)
	}).run()
}

main().catch(error => { throw error }).then()
