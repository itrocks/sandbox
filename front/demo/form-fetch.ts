import { formFetchOnSubmit } from '../form-fetch.js'

document.querySelectorAll('form').forEach(form => formFetchOnSubmit(form, response => {
	alert('Response status ' + response.status)
	console.log(response)
}))
