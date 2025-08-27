/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils/exception'
import type { AbstractConstructor, Constructor } from '@poppinss/utils/types'

import type { Container } from './container.ts'
import type { BindingResolver, Make } from './types.ts'

/**
 * A fluent builder to register contextual bindings with the
 * container.
 */
export class ContextBindingsBuilder<
  KnownBindings extends Record<any, any>,
  PinnedBinding extends AbstractConstructor<any>,
> {
  /**
   * The parent for whom to define the contextual
   * binding
   */
  #parent: Constructor<any>

  /**
   * The binding the parent asks for
   */
  #binding?: PinnedBinding

  /**
   * Container instance for registering the contextual
   * bindings
   */
  #container: Container<KnownBindings>

  /**
   * Initialize the contextual bindings builder
   */
  constructor(parent: Constructor<any>, container: Container<KnownBindings>) {
    this.#parent = parent
    this.#container = container
  }

  /**
   * Specify the binding for which to register a custom
   * resolver.
   *
   * @returns The contextual bindings builder for chaining
   */
  asksFor<Binding extends PinnedBinding>(
    binding: Binding
  ): ContextBindingsBuilder<KnownBindings, Binding> {
    this.#binding = binding
    return this as unknown as ContextBindingsBuilder<KnownBindings, Binding>
  }

  /**
   * Provide a resolver to resolve the parent dependency
   *
   * @returns Registers the contextual binding resolver
   */
  provide(resolver: BindingResolver<KnownBindings, Make<PinnedBinding>>): void {
    if (!this.#binding) {
      throw new RuntimeException(
        'Missing value for contextual binding. Call "asksFor" method before calling the "provide" method'
      )
    }

    this.#container.contextualBinding<PinnedBinding>(this.#parent, this.#binding, resolver)
  }
}
