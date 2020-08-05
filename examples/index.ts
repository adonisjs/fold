import { Ioc } from '../index'
const ioc = new Ioc<{
	'Adonis/Core/Server': { http: true }
	'Adonis/Core/Request': { url: string }
}>()

ioc.use('Adonis/Core/Request').url
