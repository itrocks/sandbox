import Action                    from '../../../action/action'
import Need                      from '../../../action/need'
import Request                   from '../../../action/request'
import dao                       from '../../../dao/dao'
import Template                  from '../../../view/html/template'
import { sep }                   from 'path'

@Need('object')
export default class Edit extends Action
{

	async html(request: Request)
	{
		const template    = new Template(request.object)
		template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
		return this.htmlResponse(await template.parseFile(
			__dirname + sep + 'edit.html',
			__dirname + sep + '../../../home/output.html'
		))
	}

	async json(request: Request)
	{
		if (request.objects.length === 1) {
			return this.jsonResponse(request.object)
		}
		if (request.objects.length > 1) {
			return this.jsonResponse(request.objects)
		}
		const objects = await dao.search(request.getType())
		return this.jsonResponse(objects)
	}

}
