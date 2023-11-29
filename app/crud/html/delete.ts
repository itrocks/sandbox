import Action from '../../action/action'
import dump from '../../debug/dump'
import Need from '../../action/need'
import Request from '../../action/request'

@Need('objects')
class Delete extends Action
{

	run(request: Request): Response
	{
		return this.htmlResponse(
			'<html lang="en"><head><meta charset="utf-8"><title>HTML delete</title></head><body>' + dump(request.objects) + '</body></html>'
		)
	}

}

export default Delete
