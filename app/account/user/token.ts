import { Store }       from '@itrocks/store'
import { randomBytes } from 'crypto'
import User            from '../user'

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
