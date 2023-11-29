import Action from '../../action/action'
import dump from '../../debug/dump'
import Need from '../../action/need'
import Request from '../../action/request'

@Need('?object')
class Save extends Action
{

	run(request: Request): Response
	{
		return this.htmlResponse(
			'<html lang="en"><head><meta charset="utf-8"><title>HTML save</title></head><body>' + dump(request.object) + '</body></html>'
		)
	}

}

export default Save
