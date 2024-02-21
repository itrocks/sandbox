import Action   from '../../action/action'
import Response from '../../server/response'

export default class New extends Action
{

	html(): Response
	{
		return this.htmlResponse(`<html lang="en">
<head><meta charset="utf-8"><title>HTML new</title></head>
<body>NEW</body>
</html>`
		)
	}

}
