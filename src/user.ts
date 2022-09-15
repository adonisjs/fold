export class User {
  #firstname: string
  #lastname: string

  constructor(firstname: string, lastname: string) {
    this.#firstname = firstname
    this.#lastname = lastname
  }

  get fullName() {
    return `${this.#firstname} ${this.#lastname}`
  }
}
