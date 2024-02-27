import Action  from '../../action/action'
import Need    from '../../action/need'
import Request from '../../action/request'
import dump    from '../../debug/dump'

@Need('?object')
export default class Save extends Action
{

	html(request: Request)
	{
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML save</title></head>
<body>${dump(request.object)}</body>
</html>`)
	}

	json(request: Request)
	{
		return this.jsonResponse(request.object)
	}

}
