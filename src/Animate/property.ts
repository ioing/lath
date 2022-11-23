import ease from './ease'
import { AnimateOperation } from './operation'

interface EaseMap {
  [key: string]: string
}

class AnimateProperty extends AnimateOperation {
  constructor(el: HTMLElement) {
    super(el)
  }
  public to(x: number | string = 0, y: number | string = 0, z: number | string = 0): this {
    x = !isNaN(x as number) ? x + 'px' : x
    y = !isNaN(y as number) ? y + 'px' : y
    z = !isNaN(z as number) ? z + 'px' : z
    this.transform('translate3d(' + x + ',' + y + ',' + z + ')')
    return this
  }
  public translate = this.to
  public translate3d = this.to
  public x(n: number | string = 0): this {
    n = !isNaN(n as number) ? n + 'px' : n
    return this.transform('translateX(' + n + ')')
  }
  public translateX = this.x
  public y(n: number | string = 0): this {
    n = !isNaN(n as number) ? n + 'px' : n
    return this.transform('translateY(' + n + 'px)')
  }
  public translateY = this.y
  public z(n: number | string = 0): this {
    n = !isNaN(n as number) ? n + 'px' : n
    return this.transform('translateZ(' + n + 'px)')
  }
  public translateZ = this.z
  public scale(x: number, y: number = x): this {
    return this.transform('scale(' +
      x + ', ' +
      (y || x) +
      ')')
  }
  public transformOrigin(x: number | string | Array<number>, y = 0): this {
    let n = 'center'
    if (Array.isArray(x)) {
      y = x[1] || 0
      x = x[0] || 0
    }
    if (typeof x === 'string') {
      n = x
    } else if (typeof x === 'number') {
      n = x + 'px' + ' ' + y + 'px'
    }
    return this.style('transform-origin', n)
  }
  public skew(x: number, y: number): this {
    return this.transform('skew(' + x + 'deg, ' + (y || 0) + 'deg)')
  }
  public skewX(n: number): this {
    return this.transform('skewX(' + n + 'deg)')
  }
  public skewY(n: number): this {
    return this.transform('skewY(' + n + 'deg)')
  }
  public scaleX(n: number): this {
    return this.transform('scaleX(' + n + ')')
  }
  public matrix(m11: number, m12: number, m21: number, m22: number, m31: number, m32: number): this {
    return this.transform('matrix(' + [m11, m12, m21, m22, m31, m32].join(',') + ')')
  }
  public scaleY(n: number): this {
    return this.transform('scaleY(' + n + ')')
  }
  public rotate(n: number): this {
    return this.transform('rotate(' + n + 'deg)')
  }
  public rotateX(n: number): this {
    return this.transform('rotateX(' + n + 'deg)')
  }
  public rotateY(n: number): this {
    return this.transform('rotateY(' + n + 'deg)')
  }
  public rotateZ(n: number): this {
    return this.transform('rotateZ(' + n + 'deg)')
  }
  public rotate3d(x: number, y: number, z: number, d: number): this {
    return this.transform('rotate3d(' + x + ', ' + y + ',' + z + ',' + d + 'deg)')
  }
  public perspective(z: number | string, parent = false): this {
    const box = (parent ? this.el.parentElement : this.el) || this.el
    const val = 'string' === typeof z ? z : z + 'px'
    if (parent && box !== this.el) {
      this.setElementProperty(box, 'transform-style', 'preserve-3d')
      this.setElementProperty(box, 'perspective', val)
    } else {
      this.transform('perspective(' + val + ')')
    }
    return this
  }
  public backface(visibility = true): this {
    return this.style('backface-visibility', visibility ? 'visible' : 'hidden')
  }
  public animate(name: string, props: { [name: string]: string }): this {
    for (const i in props) {
      if (Object.prototype.hasOwnProperty.call(props, i)) {
        this.style('animation-' + i, props[i])
      }
    }
    return this.style('animation-name', name)
  }
  public duration(n: string | number): this {
    n = 'string' === typeof n ?
      n :
      n + 'ms'
    return this.style('transition-duration', n)
  }
  public ease(s: string): this {
    s = (ease as EaseMap)[s] || s || 'ease'
    return this.style('transition-timing-function', s)
  }
  public delay(n: string | number): this {
    n = 'string' === typeof n ?
      n :
      n + 'ms'
    return this.style('transition-delay', n)
  }
  public opacity(o: number): this {
    this.setTransitionProps('opacity')
    return this.style('opacity', o + '', true)
  }
  public filter(val: string): this {
    this.style('filter', val, true)
    this.setTransitionProps('filter')
    return this
  }
  public width(n: string | number): this {
    n = 'string' === typeof n ?
      n :
      n + 'px'
    this.setTransitionProps('width')
    return this.style('width', n, true)
  }
  public height(n: string | number): this {
    n = 'string' === typeof n ?
      n :
      n + 'px'
    this.setTransitionProps('height')
    return this.style('height', n, true)
  }
  public borderRadius(n: string | number): this {
    n = 'string' === typeof n ?
      n :
      n + 'px'
    this.setTransitionProps('border-radius')
    return this.style('border-radius', n, true)
  }
}

export {
  AnimateProperty
}
