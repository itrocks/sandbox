import { Headers }  from '../server/response'
import HtmlResponse from '../server/response/html'
import JsonResponse from '../server/response/json'

export default class Action
{

	htmlResponse(body: string, statusCode: number = 200, headers: Headers = {})
	{
		return new HtmlResponse(body, statusCode, headers)
	}

	jsonResponse(data: any, statusCode: number = 200, headers: Headers = {})
	{
		return new JsonResponse(data, statusCode, headers)
	}

}
