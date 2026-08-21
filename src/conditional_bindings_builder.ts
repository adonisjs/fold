/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { AbstractConstructor } from '@poppinss/utils/types'

import type { Container } from './container.ts'
import type { BindingCondition, BindingKey, BindingResolver } from './types.ts'

/**
 * A fluent builder to register conditional bindings with the
 * container.
 *
 * Bindings registered using this builder are only used when the condition
 * returns true. The condition is evaluated on every resolution.
 */
export class ConditionalBindingsBuilder<KnownBindings extends Record<any, any>> {
  /**
   * The condition deciding whether the registered bindings
   * should be used
   */
  #condition: BindingCondition<KnownBindings>

  /**
   * Container instance for registering the conditional
   * bindings
   */
  #container: Container<KnownBindings>

  /**
   * Initialize the conditional bindings builder
   *
   * @param condition - Predicate deciding whether the bindings should be used
   * @param container - The container instance to register bindings with
   */
  constructor(condition: BindingCondition<KnownBindings>, container: Container<KnownBindings>) {
    this.#condition = condition
    this.#container = container
  }

  /**
   * Register a binding to use when the condition returns true. The factory
   * function is called on every resolution.
   *
   * @param binding - The binding key (string, symbol, or class constructor)
   * @param resolver - Factory function that resolves the binding value
   *
   * @example
   * ```ts
   * container
   *   .if((resolver) => resolver.make(FeatureFlags).isEnabled('new-payment'))
   *   .bind(PaymentGateway, (resolver) => resolver.make(BetaPaymentGateway))
   * ```
   */
  bind<Binding extends keyof KnownBindings>(
    /**
     * Need to narrow down the "Binding" for the case where "KnownBindings" are <any, any>
     */
    binding: Binding extends string | symbol ? Binding : never,
    resolver: BindingResolver<KnownBindings, KnownBindings[Binding]>
  ): void
  bind<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void
  bind<Binding>(
    binding: Binding,
    resolver: BindingResolver<
      KnownBindings,
      Binding extends AbstractConstructor<infer A>
        ? A
        : Binding extends keyof KnownBindings
          ? KnownBindings[Binding]
          : never
    >
  ): void {
    this.#container.conditionalBinding(
      this.#condition,
      binding as BindingKey,
      resolver as BindingResolver<KnownBindings, any>,
      false
    )
  }

  /**
   * Register a singleton to use when the condition returns true. The factory
   * function is called only once and the return value is cached forever.
   *
   * The condition is still evaluated on every resolution. Only the factory
   * function result is cached.
   *
   * @param binding - The binding key (string, symbol, or class constructor)
   * @param resolver - Factory function that resolves the binding value
   *
   * @example
   * ```ts
   * container
   *   .if(() => env.get('SEARCH_DRIVER') === 'typesense')
   *   .singleton(SearchService, (resolver) => resolver.make(TypesenseSearchService))
   * ```
   */
  singleton<Binding extends keyof KnownBindings>(
    /**
     * Need to narrow down the "Binding" for the case where "KnownBindings" are <any, any>
     */
    binding: Binding extends string | symbol ? Binding : never,
    resolver: BindingResolver<KnownBindings, KnownBindings[Binding]>
  ): void
  singleton<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void
  singleton<Binding>(
    binding: Binding,
    resolver: BindingResolver<
      KnownBindings,
      Binding extends AbstractConstructor<infer A>
        ? A
        : Binding extends keyof KnownBindings
          ? KnownBindings[Binding]
          : never
    >
  ): void {
    this.#container.conditionalBinding(
      this.#condition,
      binding as BindingKey,
      resolver as BindingResolver<KnownBindings, any>,
      true
    )
  }
}
