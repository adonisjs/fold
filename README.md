AdonisJS Fold
> Simplest, straightforward implementation for IoC container in JavaScript

<br />

<div align="center">

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url] [![snyk-image]][snyk-url]

</div>

## Why this project exists?
Many existing implementations of IoC containers take the concept too far and start to feel more like Java. JavaScript inherently does not have all the bells and whistles; you need to have similar IoC container benefits as PHP or Java.

Therefore, with this project, I live to the ethos of JavaScript and yet build a container that can help you create loosely coupled systems.

I have explained the [reasons for using an IoC container](https://github.com/thetutlage/meta/discussions/4) in this post. It might be a great idea to read the post first ✌️

## Goals of the project

- **Keep the code visually pleasing**. If you have used any other implementation of an IoC container, you will automatically find `@adonisjs/fold` easy to read and follow.
- **Keep it simple**. JavaScript projects have a few reasons for using an IoC container, so do not build features that no one will ever use or understand.
- **Build it for JavaScript and improve with TypeScript** - The implementation of `@adonisjs/fold` works with vanilla JavaScript. It's just you have to write less code when using TypeScript. Thanks to its decorators metadata API.

## Usage
Install the package from the npm packages registry.

```sh
npm i @adonisjs/fold

# yarn lovers
yarn add @adonisjs/fold

# pnpm followers
pnpm add @adonisjs/fold
```

Once done, you can import the `Container` class from the package and create an instance. For the most part, you will use a single instance of the container.

```ts
import { Container } from '@adonisjs/fold'

const container = new Container()
```

## Making classes
You can construct an instance of a class by calling the `container.make` method. The method is asynchronous since it allows for lazy load dependencies in factory functions (More on factory functions later).

```ts
class UserService {}

const service = await container.make(UserService)
assert(service instanceof UserService)
```

In the previous example, the `UserService` did not have any dependencies; therefore, it was straightforward for the container to make an instance of it.

Now, let's look at an example where the `UserService` needs an instance of the Database class.

```ts
class Database {}

class UserService {
  static containerInjections = {
    constructor: [Database]
  }

  constructor (db) {
    this.db = db
  }
}

const service = await container.make(UserService)
assert(service.db instanceof Database)
```

The `static containerInjections` property is required by the container to know which values to inject when creating an instance of the class.

This property can define the dependencies for the class methods (including the constructor). The dependencies are defined as an array. The first item from the array will be injected as the first argument and so on.

> **Do you remember?** I said that JavaScript is not as powerful as Java or PHP. This is a classic example of that. In other languages, you can use reflection to look up the classes to inject, whereas, in JavaScript, you have to tell the container explicitly.

### TypeScript to the rescue
Wait, you can use decorators with combination of TypeScript's [emitDecoratorMetaData](https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata) option to perform reflection.

It is worth noting, TypeScript decorators are not as powerful as the reflection API in other languages. For example, in PHP, you can use interfaces for reflection. Whereas in TypeScript, you cannot.

With that said, let's look at the previous example, but in TypeScript this time.

```ts
import { inject } from '@adonisjs/fold'

class Database {}

@inject()
class UserService {
  constructor (db: Database) {
    this.db = db
  }
}

const service = await container.make(UserService)
assert(service.db instanceof Database)
```

The `@inject` decorator looks at the types of all the constructor parameters and defines the `static containerInjections` property behind the scenes. 

> **Note**: The decorator-based reflection can only work with concrete values, not interfaces or types since they are removed during runtime.

## Making class with runtime values
When calling the `container.make` method, you can pass runtime values that take precedence over the `containerInjections` array. 

In the following example, the `UserService` accepts an instance of the ongoing HTTP request as the 2nd param. Now, when making an instance of this class, you can pass that instance manually.

```ts
import { inject } from '@adonisjs/fold'
import { Request } from '@adonisjs/core/src/Request'

class Database {}

@inject()
class UserService {
  constructor (db: Database, request: Request) {
    this.db = db
    this.request = request
  }
}
```

```ts
createServer((req) => {
  const runtimeValues = [undefined, req]
  
  const service = await container.make(UserService, runtimeValues)
  assert(service.request === req)
})
```

In the above example:

- The container will create an instance of the `Database` class since it is set to `undefined` inside the runtime values array.
- However, for the second position (ie `request`), the container will use the `req` value.

## Calling methods
You can also call class methods to look up/inject dependencies automatically. 

In the following example, the `UserService.find` method needs an instance of the Database class. The `container.call` method will look at the `containerInjections` property to find the values to inject.

```ts
class Database {}

class UserService {
  static containerInjections = {
    find: [Database]
  }

  async find(db) {
    await db.select('*').from('users')
  }
}

const service = await container.make(UserService)
await container.call(service, 'find')
```

The TypeScript projects can re-use the same `@inject` decorator.

```ts
class Database {}

class UserService {
  @inject()
  async find(db: Database) {
    await db.select('*').from('users')
  }
}

const service = await container.make(UserService)
await container.call(service, 'find')
```

The **runtime values** are also supported with the `container.call` method.

## Container bindings
Alongside making class instances, you can also register bindings inside the container.

Bindings are simple key-value pairs. The value is a factory function invoked when someone resolves the binding from the container.

```ts
const container = new Container()

container.bind('db', () => {
  return new Database()
})

const db = await container.make('db')
assert(db instanceof Database)
```

I used a string-based key for the binding name in the previous example. However, you can also bind `Symbols` or maybe the `class constructor` directly.

> **Warning**: The container binding can either be a `string`, a `symbol` or a `class constructor`.

```ts
container.bind(Database, () => {
  return new Database()
})
```

Now, when someone calls `container.make(Database)`, the container will invoke the factory function and uses its return value. So basically, you have taken over the construction of a class from the container.

### Factory function arguments
The factory receives the following three arguments.

- The `resolver` reference. Resolver is something container uses under the hood to resolve dependencies. The same instance is passed to the factory, so that you can resolve dependencies to construct the class.
- An optional array of runtime values defined during the `container.make` call.

```ts
container.bind(Database, (resolver, runtimeValues) => {
  return new Database()
})
```

### When to use the factory functions?
I am answering this question from a framework creator perspective. I never use the `@inject` decorator on my classes shipped as packages. Instead, I define their construction logic using factory functions and keep classes free from any knowledge of the container.

So, if you create packages for AdonisJS, I highly recommend using factory functions. Leave the `@inject` decorator for the end user.

## Binding singletons
You can bind a singleton to the container using the `container.singleton` method. It is the same as the `container.bind` method, except the factory function is called only once, and the return value is cached forever.

```ts
container.singleton(Database, () => {
  return new Database()
})
```

## Binding values
Along side the factory functions, you can also bind direct values to the container.

```ts
container.bindValue('router', router)
```

The values are given priority over the factory functions. So, if you register a value with the same name as the factory function binding, the value will be resolved from the container.

The values can also be registered at the resolver level. In the following example, the `Request` binding only exists for an isolated instance of the resolver and not for the entire container.

```ts
const resolver = container.createResolver()
resolver.bindValue(Request, req)

await resolve.make(SomeClass)
```

## Observing container
You can pass an instance of the [EventEmitter](https://nodejs.org/dist/latest-v18.x/docs/api/events.html#class-eventemitter) or [emittery](https://github.com/sindresorhus/emittery) to listen for events as container resolves dependencies.

```ts
import { EventEmitter } from 'node:events'
const emitter = new EventEmitter()

emitter.on('container:make', ({ value, binding }) => {
  // value is the resolved value
  // binding name can be a mix of string, class constructors, and symbols.
})

const container = new Container({ emitter })
```

> **Note**: Events are not emitted for the runtime values since the container does not resolve them. However, they are emitted by the runtime bindings.

## Debugging container
You can define a function to log the lookup calls as the container attempts to resolve dependencies.

The logs are individual objects with the parent id and the resolution status.

```ts
const container = new Container({
  log: function (data) {
    logger.trace(data)
  }
})
```

```ts
// Resolved
{
  id: 2,
  parentId: 1,
  binding: Database,
  value: new Database(),
  method: "constructor",
  position: 0
  status: 'resolved'
  error: null,
}

// Error
{
  id: 2,
  parentId: 1,
  binding: Database,
  value: null,
  method: "constructor",
  position: 0
  status: 'error'
  error: new Error('Unable to resolve Database binding'),
}
```

- `id` is the unique id for the resolution. They are only generated when a logger is attached.
- `parentId` is the unique id of the parent for which the dependency is getting resolved.
- `binding` is the binding to resolve.
- `value` is the resolved value.
- `method` is the method name in which we will inject the resolved value.
- `position` is the argument position in which we will inject the value.
- `status` is the resolution status.
- `error` exists only when the status is an error.

## Container providers
Container providers are static functions that can live on a class to resolve the injections for a given method.

```ts
import { ContainerResolver } from '@adonisjs/fold'
import { InspectableConstructor } from '@adonisjs/fold/types'

class UsersController {
  static containerProvider(
    binding: InspectableConstructor,
    property: string | symbol | number,
    resolver: ContainerResolver<any>,
    runtimeValues?: any[]
  ) {
  }
}
```

### Why would I use custom providers?
Custom providers can be handy when creating an instance of the class is not enough to construct it properly.

Let's take an example of [AdonisJS route model binding](https://github.com/adonisjs/route-model-binding). With route model binding, you can query the database using models based on the value of a route parameter and inject the model instance inside the controller.

```ts
import User from '#models/User'
import { bind } from '@adonisjs/route-model-binding'

class UsersController {
  @bind()
  public show(_, user: User) {}
}
```

Now, if you use the `@inject` decorator to resolve the `User` model, then the container will only create an instance of User and give it back to you.

However, in this case, we want more than just creating an instance of the model. We want to look up the database and create an instance with the row values.

This is where the `@bind` decorator comes into the picture. To perform database lookups, it registers a custom provider on the `UsersController` class.

[gh-workflow-image]: https://img.shields.io/github/workflow/status/adonisjs/fold/test?style=for-the-badge
[gh-workflow-url]: https://github.com/adonisjs/fold/actions/workflows/test.yml "Github action"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/fold/latest.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@adonisjs/fold/v/latest "npm"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[license-url]: LICENSE.md
[license-image]: https://img.shields.io/github/license/adonisjs/fold?style=for-the-badge

[snyk-image]: https://img.shields.io/snyk/vulnerabilities/github/adonisjs/fold?label=Snyk%20Vulnerabilities&style=for-the-badge
[snyk-url]: https://snyk.io/test/github/adonisjs/fold?targetFile=package.json "snyk"
