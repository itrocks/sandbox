import Action from '../../action/action'
import dao from '../../dao/dao'
import dump from '../../debug/dump'
import Request from '../../action/request'

class List extends Action
{

	async run(request: Request): Promise<Response>
	{
		return dao.search(request.type).then(objects => this.htmlResponse(
			'<html lang="en"><head><meta charset="utf-8"><title>HTML list</title></head><body>' + dump(objects) + '</body></html>'
		))
	}

}

export default List
