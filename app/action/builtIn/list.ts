import Action   from '../../action/action'
import Request  from '../../action/request'
import dao      from '../../dao/dao'
import dump     from '../../debug/dump'
import Response from '../../server/response'

export default class List extends Action
{

	async html(request: Request): Promise<Response>
	{
		const objects = await dao.search(request.getType())
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML list</title></head>
<body>${dump(objects)}</body>
</html>`)
	}

	async json(request: Request): Promise<Response>
	{
		const objects = await dao.search(request.getType())
		return this.jsonResponse(objects)
	}

}
