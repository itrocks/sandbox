import Action  from '../../action/action'
import Request from '../../action/request'
import dao     from '../../dao/dao'
import dump    from '../../debug/dump'

export default class List extends Action
{

	async html(request: Request)
	{
		const objects = await dao.search(request.getType())
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML list</title></head>
<body>${dump(objects)}</body>
</html>`)
	}

	async json(request: Request)
	{
		const objects = await dao.search(request.getType())
		return this.jsonResponse(objects)
	}

}
