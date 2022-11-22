import { EventProvider } from '../Event'
import { requestAnimationFrame as rAF, setTimeout } from '../lib/util'
const gCS = window.getComputedStyle

type PropertyValue = string | null
interface Properties {
  [property: string]: PropertyValue
}

class AnimateOperation extends EventProvider {
  public el: HTMLElement
  private properties: Properties = {}
  private transforms: Properties = {}
  private transforming = false
  private propertiesGroup: Array<Properties> = []
  private scene: Array<() => void> = []
  private transitionProps: Array<string> = []
  constructor(el: HTMLElement) {
    super()
    this.el = el
    this.resetTransitionDuration()
  }

  private isSubPropertyName(subName: string, name: string): boolean {
    if (name === 'all') return true
    if (name.indexOf('-') === -1) {
      return subName.indexOf(name) === 0
    } else {
      const nameGroup = name.split('-')
      const subNameGroup = name.split('-')
      return nameGroup[0] === subNameGroup[0] && nameGroup[nameGroup.length - 1] === subNameGroup[subNameGroup.length - 1]
    }
  }

  private onceTransitionend(fn: () => void): void {
    if (!this.getDuration()) {
      setTimeout(fn, 0)
      return
    }
    const endPropertyName = this.getMaxDurationPropertyName()
    const once = (e: TransitionEvent) => {
      if (e.target !== this.el) return
      if (!this.isSubPropertyName(e.propertyName, endPropertyName)) return
      fn()
      this.el.removeEventListener('transitionend', once, false)
    }
    this.el.addEventListener('transitionend', once, false)
  }

  private applySegue(): this {
    const transform: Array<PropertyValue> = []
    if (!this.transforms['translate3d'] && !this.transforms['translateZ']) {
      this.transforms['translateZ'] = 'translateZ(0)'
    }
    for (const i in this.transforms) {
      transform.push(this.transforms[i])
    }
    if (transform.length) {
      this.style('transform', transform.join(' '))
    }
    return this
  }

  private applyProperties(): this {
    const properties = this.propertiesGroup.shift()
    this.transforming = true
    for (const property in properties) {
      this.setElementProperty(this.el, property, properties[property])
    }

    this.onceTransitionend(() => {
      this.clear()
      this.next()
    })
    return this
  }

  private resetTransitionDuration(): void {
    this.setElementProperty(this.el, 'transition-duration', '0ms')
  }

  public setElementProperty(element: HTMLElement, property: string, value: string | null): void {
    if (element.style.getPropertyValue('-webkit-' + property) !== undefined) {
      element.style.setProperty('-webkit-' + property, value)
    }
    element.style.setProperty(property, value)
  }

  public style(property: string, val?: string): this {
    if (property.indexOf('transition') === -1 && property.indexOf('animation') === -1) this.setTransitionProps(property)
    this.properties[property] = val === undefined ? '' : val
    return this
  }

  public current(property: string): string {
    return gCS(this.el).getPropertyValue(property)
  }

  public getDuration(): number {
    return parseFloat(gCS(this.el).transitionDuration)
  }

  public getMaxDurationPropertyName(): string {
    const duration = gCS(this.el).transitionDuration.split(',').map((time) => parseFloat(time))
    const property = gCS(this.el).transitionProperty.split(',')
    const maxTimeIndex = duration.indexOf(Math.max(...duration))

    return property[maxTimeIndex].trim()
  }

  public transform(transform: string): this {
    this.setTransitionProps('transform')
    const propName = transform.match(/\w+\b/)?.[0]
    if (propName) this.transforms[propName] = transform
    return this
  }

  public setTransitionProps(property: string): this {
    if (this.transitionProps.length === 0) {
      this.transitionProps = gCS(this.el).transitionProperty.split(',').map((name) => name.trim())
    }
    if (this.transitionProps.indexOf(property) === -1) this.transitionProps.push(property)
    return this
  }

  public calc(property: string, calc: (current: number) => number = (current) => current): this {
    const current = parseInt(this.current(property), 10)
    return this.style(property, calc(current) + 'px')
  }

  public add(property: string, val: number): this {
    return this.calc(property, (current) => current + val)
  }

  public subc(property: string, val: number): this {
    return this.calc(property, (current) => current - val)
  }

  public next(): this {
    if (this.scene.length) {
      this.scene.shift()?.()
    }
    if (this.scene.length === 0) {
      this.init()
    } else {
      rAF(() => { this.applyProperties() })
    }
    return this
  }

  public clear(): this {
    this.transforms = {}
    return this
  }

  public init(): this {
    if (this.getDuration()) {
      this.resetTransitionDuration()
    }
    this.clear()
    this.transforming = false
    return this
  }

  public then(fn: () => void = () => undefined): this {
    this.applySegue()
    this.style('transition-property', this.transitionProps.join(', '))
    this.propertiesGroup.push(this.properties)
    this.properties = {}
    this.scene.push(() => fn?.call(this))
    return this
  }

  public end(fn?: () => void) {
    return new Promise<void>((resolve) => {
      fn = fn ?? (() => resolve())
      this.then(fn)
      if (this.transforming) return
      rAF(() => { this.applyProperties() })
    })
  }
}
export {
  AnimateOperation
}
