import { IocContract } from '../src/Contracts'

type Bindings = {
  'Adonis/Core/Server': { http: true }
  'Adonis/Core/Request': { url: string }
}
const ioc = {} as IocContract<Bindings>

ioc.bind('Adonis/Core/Request', () => {
  return {
    url: '/',
  }
})

ioc.fake('Adonis/Core/Request', () => {
  return {
    url: '/',
  }
})

ioc.use('Adonis/Core/Request').url
ioc.use({ namespace: 'Adonis/Core/Request', type: 'binding' }).url

ioc.make('Adonis/Core/Request').url
ioc.make({ namespace: 'Adonis/Core/Request', type: 'binding' }).url

class Foo {
  public foo = 'foo'
  public run() {}
  public walk() {}
}

class FooPlain {
  public static makePlain: true = true
  public foo = 'foo'
}

ioc.make('Adonis/Core/Request').url
ioc.make(Foo).foo
ioc.make(FooPlain).makePlain

ioc.hasFake('Adonis/Core/Request')
ioc.hasFake('foo')

ioc.hasBinding('Adonis/Core/Request')
ioc.hasBinding('foo')

ioc.with(['Adonis/Core/Request', 'foo'], (req, foo) => {
  req.url
  foo
})

ioc.call(ioc.make(Foo), 'run', [])
