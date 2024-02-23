import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import dao      from '../../dao/dao'
import Template from '../../view/html/template'

@Need('object')
export default class Output extends Action
{

	async html(request: Request)
	{
		const template = new Template(request.object)
		return this.htmlResponse(await template.parseFile(__dirname + '/output.html'))
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
