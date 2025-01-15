import dataSource      from '@itrocks/storage'
import { htmlToText }  from 'html-to-text'
import * as fs         from 'node:fs/promises'
import mailer          from 'nodemailer'
import config          from '../../../local/smtp'
import Action          from '../../action/action'
import Save            from '../../action/builtIn/save/save'
import Request         from '../../action/request'
import smtp            from '../../config/smtp'
import { lessOrEqual } from '../../dao/functions'
import { lang, tr }    from '../../locale/translate'
import User            from '../user'
import Token           from './token'

export default class Forgot extends Action
{

	async html(request: Request<User>)
	{
		const dao = dataSource()
		let defaultUser  = new request.type
		let templateName = 'forgot'
		let user: User|undefined

		if (request.request.data.token) {
			const momentAgo = new Date()
			momentAgo.setHours(momentAgo.getHours() - 1)
			for (const oldToken of await dao.search(Token, { date: lessOrEqual(momentAgo) })) {
				await dao.delete(oldToken, 'token')
			}
			const token     = (await dao.search(Token, { token: request.request.data.token }))[0]
			const tokenUser = token?.user
			if (tokenUser) {
				if (request.request.data.password) {
					await ((new Save).dataToObject(tokenUser, { password: request.request.data.password }))
					await dao.save(tokenUser)
					await dao.delete(token, 'token')
					return this.htmlTemplateResponse(tokenUser, request, __dirname + '/forgot-done.html')
				}
				tokenUser.password = ''
				return this.htmlTemplateResponse(token, request, __dirname + '/forgot-reset.html')
			}
		}

		const email = request.request.data.email
		if (email && (typeof email === 'string')) {
			defaultUser.email = email
			user = (await dao.search(User, { email }))[0]

			if (user) {
				const token = await dao.save(new Token(user))
				const transporter = mailer.createTransport({
					auth:   { pass: config.pass, user: config.user },
					host:   config.host,
					port:   config.port,
					secure: config.secure,
				})
				const content = (await fs.readFile(__dirname + '/forgot-email-' + lang + '.html')) + ''
				const link    = request.request.url + '?token=' + token.token
				const from    = (smtp.from.name ? ('"' + smtp.from.name + '" ') : '') + '<' + smtp.from.email + '>'
				const html    = content.replaceAll('app://(resetLink)', link)
				try {
					await transporter.sendMail({
						from,
						html,
						subject: tr('Password reset request'),
						text:    htmlToText(html, {wordwrap: 130}),
						to:      '"' + user.login + '" <' + user.email + '>'
					})
					templateName = 'forgot-sent'
				}
				catch (exception) {
					templateName = 'forgot-error'
				}
			}
			else {
				templateName = 'forgot-error'
			}
		}

		return this.htmlTemplateResponse(user ?? defaultUser, request, __dirname + '/' + templateName + '.html')
	}

}
