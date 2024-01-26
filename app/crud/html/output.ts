import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import Template from '../../view/html/template'

@Need('object')
export default class Output extends Action
{

	async run(request: Request)
	{
		const template = new Template(__dirname + '/output.html', request.object)
		return this.htmlResponse(await template.parseFile())
	}

}
