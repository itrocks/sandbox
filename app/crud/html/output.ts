import Action from '../../action/action'
import Need from '../../action/need'
import Request from '../../action/request'
import Template from '../../view/html/template'

@Need('object')
class Output extends Action
{

	async run(request: Request)
	{
		const template = new Template(import.meta.dir + '/output.html', request.object)
		return template.parseFile().then(result => this.htmlResponse(result))
	}

}

export default Output
