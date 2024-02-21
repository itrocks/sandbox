import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import dump     from '../../debug/dump'
import Response from '../../server/response'

@Need('?object')
export default class Save extends Action
{

	html(request: Request): Response
	{
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML save</title></head>
<body>${dump(request.object)}</body>
</html>`)
	}

	json(request: Request): Response
	{
		return this.jsonResponse(request.object)
	}

}
