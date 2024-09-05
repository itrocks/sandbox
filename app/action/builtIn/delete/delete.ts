import Action   from '../../../action/action'
import Need     from '../../../action/need'
import Request  from '../../../action/request'
import dao      from '../../../dao/dao'
import Template from '../../../view/html/template'
import { sep }  from 'path'

@Need('objects')
export default class Delete extends Action
{

	async html(request: Request)
	{
		const objects = request.objects
		for (const object of objects) {
			await dao.delete(object)
		}
		const template    = new Template({ objects, type: request.getType() })
		template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
		return this.htmlResponse(await template.parseFile(
			__dirname + sep + 'delete.html',
			__dirname + sep + '../../../home/output.html'
		))
	}

	async json(request: Request)
	{
		const objects = request.objects
		for (const object of objects) {
			await dao.delete(object)
		}
		return this.jsonResponse(objects)
	}

}
