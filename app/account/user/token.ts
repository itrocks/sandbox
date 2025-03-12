import { Store }       from '@itrocks/store'
import { User }        from '@itrocks/user'
import { randomBytes } from 'crypto'

@Store('password_reset_token')
export default class Token
{

	date  = new Date()
	token = randomBytes(32).toString('hex')
	user?: User

	constructor(user?: User)
	{
		this.user = user
	}

}
