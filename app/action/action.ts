import { Headers }  from '../server/response'
import HtmlResponse from '../server/response/html'
import JsonResponse from '../server/response/json'
import Template     from '../view/html/template'
import Request      from './request'

export default class Action
{

	htmlResponse(body: string, statusCode = 200, headers: Headers = {})
	{
		return new HtmlResponse(body, statusCode, headers)
	}

	jsonResponse(data: any, statusCode = 200, headers: Headers = {})
	{
		return new JsonResponse(data, statusCode, headers)
	}

	async htmlTemplateResponse(data: any, request: Request, templateFile: string, statusCode = 200, headers: Headers = {})
	{
		const template = new Template(
			data,
			{ action: request.action, request, session: request.request.session }
		)
		template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
		return this.htmlResponse(
			await template.parseFile(templateFile, __dirname + '/../home/container.html'), statusCode, headers
		)
	}

}
