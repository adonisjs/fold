<div align="center">
  <img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1558612869/adonis-readme_zscycu.jpg" width="600px">
</div>

# Adonis fold
> IoC container for Node and Typescript projects. Used by Adonis framework

[![circleci-image]][circleci-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

## Features
1. Support for adding bindings to the container with unique namespace.
2. Dependency injection
3. Method injection
4. Ships with Typescript decorators to make the process of DI even more intutitve.
5. Support for factory functions
6. Faking out dependencies inside container.
7. Service providers with lifecycle methods to register and use bindings from the container.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Background](#background)
  - [Concrete vs loose dependencies](#concrete-vs-loose-dependencies)
  - [Dependency composition](#dependency-composition)
- [Usage](#usage)
- [Binding to the container](#binding-to-the-container)
  - [Defining aliases](#defining-aliases)
- [Faking bindings](#faking-bindings)
- [API](#api)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Background
> If you already understand the concepts of Dependency Injection and a Dependency container, then feel free to skip this section, otherwise, it's important to understand the basics of DI before using a dependency container.

When writing software, you can have **concrete** or **loose** dependencies on other parts of your code. 

- Concrete dependencies are something that you cannot swap based upon a given environment or condition inside your code. 
    
    For example: When you `require` a dependency at the top of your code, you cannot swap it with something else during tests.
    
    ```js
    const mailer = require('./mailer')
    
    class UserController {
      async store () {
        const user = await SomeDbOperation()
        await mailer.send('welcome.txt', user)
      }
    }
    ```

- A dependency is considered loose, when you can easily swap it with a similar value. This is where the concept of `Dependency Injection` comes into the picture.

    For example: Accepting the same `mailer` object as a constructor argument gives you the option to swap it with a similar object during tests.
    
    ```js
    class UserController {
      constructor (mailer) {
        this.mailer = mailer     
      }

      async store () {
        const user = await SomeDbOperation()
        await this.mailer.send('welcome.txt', user)
      }
    }
    ```

### Concrete vs loose dependencies
There is no need to have loose dependencies for code that is meant to behave same in different runtime conditions or environment.

Injecting `lodash` to a class constructor is a not a great idea. However, code that is dependent on external factors or have side-effects must always be kept as a loose dependency to keep the testing experience seamless.

### Dependency composition
Once you start writing code, which extensively makes use Dependency Injection, you face a problem of composing dependencies everywhere inside your code.

Take the following example, where you want to create a `Session` class that relies on `redis` to store session data.

```js
class Session {
  constructor (redis) {
    this.redis = redis
  }
  
  store () {}
  get () {}
}
```

The `Redis` class now relies on the config class.

```js
class Redis {
  constructor (config) {
    this.config = config
  }
}
```

The `Config` class needs a path to load the configuration

```js
class Config {
  constructor (configPath) {
  }
}
```

Everytime you want to use the `Session` class, you have to compose the entire dependency chain.

```js
const session = new Session(new Redis(new Config(__dirname)))
```

Just by looking at the above code, you can realize that a real world system will quickly spin out of your hands.

By using a dependency injection container or IoC container, you offload the composition work to the container instead.

> The following example is written in Typescript. However, the similar results can be achieved in Javascript as well. Read the rest of the docs for same.

```ts
import { inject, Ioc } from '@adonisjs/fold'
import { Redis } from './Redis'

const ioc = new Ioc()

@inject()
class Session {
  constructor (redis: Redis) {}
}

const session = ioc.make<Session>(Session)

session.redis // instance of redis
```

Wow! The IoC container will also satisfy all the dependencies of the `Redis` class as well (upto unlimited depth).

## Usage
Install the package from npm registery as follows:

> `reflect-metadata` package is required if you are planning to make use of Decorators.

```sh
npm i @adonisjs/fold reflect-metadata

# yarn user
yarn add @adonisjs/fold reflect-metadata
```

And use the package as follows

```js
import { Ioc } from '@adonisjs/fold'

const ioc = new Ioc()

ioc.bind('App/Foo', () => {
  return 'foo'
})

assert.equal(ioc.use('App/Foo'), 'foo')
```

## Binding to the container
You can bind dependencies to the container as follows:

```ts
import { Ioc } from '@adonisjs/fold'

const ioc = new Ioc()

class Config {}
ioc.bind('App/Config', () => {
  return new Config(__dirname)
})
```

In order to use the `App/Config` binding, one needs to call the `use` or `make` methods. Both methods behaves the same, when pulling a binding from the IoC container.

```ts
ioc.use('App/Config')
```

Everytime the `use` method is called. The container will execute the `callback` provided to the bind method and returns the fresh value from it. However, you must use the `ioc.singleton` method, if you want to return the same value everytime.

```ts
ioc.singleton('App/Config', () => {
  return new Config(__dirname)
})

ioc.use('App/Config') === ioc.use('App/Config')
```

### Defining aliases
In order to keep the namespaces unique, we recommend using `Project/Scope/Module` pattern to define namespaces. These namespaces can get really big and hence harder to remeber. 

To encouter this situation, you can also define conventional aliases for your namespaces.

```ts
ioc.singleton('Adonis/Src/Config', () => {
  return new Config(__dirname)
})

ioc.alias('Adonis/Src/Config', 'Config')
```

## Faking bindings
One of the powerful feature of the IoC container, is the ability to define fakes for your existing bindings. The fakes are really useful when you are writing tests and doesn't want to use the real binding.

```ts
class Mailer {
  public send () {}
}

ioc.bind('Adonis/Src/Mailer', () => {
  return new Mailer()
})
```

The following User service relies on the mailer to send a user the welcome email.

```ts
const mailer = use('Adonis/Src/Mailer')

class UserService {
  store () {
    mailer.send()
  }
}
```

During tests, you can provide a fake for the mailer using the following code.

```ts
import { UserService } from './UserService'
import { Ioc } from '@adonisjs/fold'

class FakeMailer {
  constructor () {
    this.sendCalls = []
  }

  send (template, user) {
    this.sendCalls.push({ template, user })
  }
}

const mailer = new FakeMailer()

const ioc = new Ioc()

// Required for fakes to work
ioc.useProxies()

ioc.fake('Adonis/Src/Mailer', () => {
  return mailer
})

new UserService().store()

assert.lengthOf(mailer.sendCalls, 1)
assert.equal(mailer.sendCalls[0].template, 'welcome.txt')
assert.exists(mailer.sendCalls[0].user.email)

// Cleanup fake
ioc.restore('Adonis/Src/Mailer')
```

## API
Following are the autogenerated files via Typedoc
* [API](docs/README.md)

[circleci-image]: https://img.shields.io/circleci/project/github/adonisjs/fold/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/adonisjs/fold "circleci"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/fold.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/fold "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/aur/license/pac.svg?style=for-the-badge
