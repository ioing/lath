import { Application } from '../Application'
import { SegueAnimation } from './Animation'
import { requestIdleCallback, setTimeout, testHasSnapReset } from '../lib/util'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'
import loadWebAnimations from '../lib/webAnimations/load'
import resetAllAnimations from '../lib/webAnimations/reset'
import waitAllAnimations from '../lib/webAnimations/finished'
import { SegueAnimateState, SegueActionOrigin, Applet, PresetConfig } from '../types'

type SegueToOptions = [
  id: string,
  param?: string,
  pushStatus?: -1 | 0 | 1,
  touches?: SegueActionOrigin,
  disableAnimation?: boolean
]

// old; ios < 15
const HasSnapReset = testHasSnapReset()

class SegueSwitch extends SegueAnimation {
  private readonly windowSet: string[] = []
  private readonly promiseQueue: (Promise<void> | undefined)[] = []
  private readonly promiseParamQueue: [...SegueToOptions][] = []
  constructor(app: Application, presetConfig: PresetConfig) {
    super(app, presetConfig)
    this.delayDynamicImport()
  }

  // Transition to the main entry to the new page
  public async to(...args: SegueToOptions): Promise<void> {
    const promise = this.next() || this.promise(...args)
    return this.pushPromise(this.bindPromiseDone(promise), args)
  }

  // Attach to Applet
  public attachAppletViewport(applet: Applet): void {
    if (applet.viewport) return
    const viewport = document.createElement(applet.rel + '-viewport')
    viewport.setAttribute('name', applet.id)
    applet.attach(viewport)
    this.getSuperViewport(applet).appendChild(viewport)
  }

  private delayDynamicImport(): void {
    requestIdleCallback(() => {
      loadWebAnimations()
    })
  }

  private setStepState(disableAnimation?: boolean) {
    this.target = this.getSuperViewport()
    this.superSwitch = this.checkSwitchViewport()
    // step 1
    if (!this.fromHistoryBack) this.applet.setLevel(this.viewportLevelLength++ + 1)
    // step 2
    this.hasAnimation = disableAnimation ? false : this.checkAnimationNamed()
  }

  private async resetAppletViewport(applet: Applet, visibility = this.immovable): Promise<void> {
    const viewport = applet.viewport as HTMLElement
    const systemLevel = ['frameworks', 'system'].includes(applet.rel)
    await waitAllAnimations(viewport)
    viewport.style.cssText = ''
    if (systemLevel) return
    viewport.style.cssText = `
      position: absolute;
      ${fullscreenBaseCSSText}
      z-index: ${applet.viewLevel};
      transition-duration: 0ms;
      transition-delay: 0ms;
      transition-property: all;
      transform: ${visibility ? 'translate(0, 0)' : 'translate(0, 200%)'};
      backface-visibility: hidden;
      filter: none;
      opacity: 1;
      overflow: hidden;
      contain: layout size;
    `
    await resetAllAnimations(viewport)
  }

  // Gets the previous queue task
  private prev(): Promise<void> | undefined {
    return this.promiseQueue[0]
  }

  // Generates an execution queue
  private next(): Promise<void> | undefined {
    const prev = this.prev()
    const next = () => this.bindPromiseDone(this.promise(...this.promiseParamQueue[0]))
    if (prev) {
      return prev.then(next).catch(next)
    }
    return
  }

  // Add a new task
  private pushPromise<P extends Promise<void>>(promise: P, param: SegueToOptions): P {
    this.promiseParamQueue.push(param)
    this.promiseQueue.push(promise)
    return promise
  }

  // Remove a complete task
  private shiftPromise(): void {
    this.promiseParamQueue.shift()
    this.promiseQueue.shift()
  }

  // Execution when the task is complete
  private async bindPromiseDone<P extends Promise<void>>(promise: P): Promise<void> {
    const shift = () => this.shiftPromise()
    return promise.then(shift).catch(() => {
      shift()
      this.to404()
    })
  }

  // Control memory growth
  private limit(applet: Applet): void {
    const { id } = applet
    const limit = Math.max(this?.options?.limit || 3, 2)
    const index = this.windowSet.indexOf(id)

    if (this.applet.rel !== 'applet' || this.applet.config.background === true) return
    if (index !== -1) this.windowSet.splice(index, 1)
    if (!applet.parentApplet) this.windowSet.push(id)

    if (this.windowSet.length > limit) {
      this.application.applets[this.windowSet.splice(0, 1)[0]]?.destroy()
    }
  }

  // Destroy Applet if needed 
  private destroy(applet: Applet): void {
    if (applet.transient && this.prevHistoryStep === -1) {
      this.application.del(applet.id).then(() => {
        const index = this.windowSet.indexOf(applet.id)
        this.windowSet.splice(index, 1)
      })
    } else {
      applet.guarding().then((life) => {
        if (life) return
        applet.destroy().then(() => {
          const index = this.windowSet.indexOf(applet.id)
          this.windowSet.splice(index, 1)
        })
      })
    }
  }

  private async to404(): Promise<void> {
    if (!this.options.notFound) return Promise.resolve()
    return this.promise(this.options.notFound, this.param + (this.param.indexOf('?') === -1 ? '?' : '&') + '__notFoundId=' + this.id, this.prevHistoryStep)
  }

  private async promise(...args: SegueToOptions): Promise<void> {
    const [id, param = '', pushState = 1, touches, disableAnimation] = args
    // next is undefined
    if (!id) return Promise.resolve()
    const prevId = this.id
    const applet = this.application.applets[id]
    const prevApplet = this.application.applets[prevId]
    const appletGroup = prevApplet ? [applet, prevApplet] : [applet]
    if (!applet) {
      return this.application.get(id).then(() => this.promise(...args))
    }
    if (id === this.id) {
      return Promise.resolve()
    }
    if (applet.mountBehavior?.agentSegue) {
      return applet.mountBehavior?.agentSegue()
    }
    this.prevId = this.id
    this.id = id
    this.param = this.getSearch(param)
    this.applet = applet
    this.prevPrevApplet = this.prevApplet
    this.prevApplet = prevApplet
    this.appletGroup = appletGroup
    this.prevHistoryStep = pushState
    this.touches = touches
    this.fromOverscrollHistoryNavigation = this.isOverscrollHistoryNavigation

    this.setStepState(disableAnimation)
    this.attachAppletViewport(applet)
    this.resetAppletViewport(applet)
    this.requestRegisterHistory(id, applet.config.title, param as string)
    applet.setActionOrigin(touches)
    await applet.setParam(this.param)
    await applet.build()
    return this.start().then(async () => this.transform().then(async (stillness) => {
      await this.end(stillness)
      this.limit(applet)
      this.application.pullDependencies(applet.config?.prerender).then(() => {
        this.application.trigger('prerenderComplete')
      })
      if (applet.config.title) {
        document.title = applet.config.title
      }
    }))
  }

  private pos() {
    let x = this.touches?.x || 0
    let y = this.touches?.y || 0
    let attach: string | Array<number> = 'center'
    let origin: string | Array<number> = 'center'
    const width = this.relativeViewport.offsetWidth
    const height = this.relativeViewport.offsetHeight
    if (x && y) {
      origin = [x, y]
      if (x < width / 4) {
        x = 0
      } else if (x > width * 3 / 4) {
        x = width
      }
      if (y < height / 4) {
        y = 0
      } else if (y > height * 3 / 4) {
        y = height
      }
      attach = [x, y]
    }
    return {
      x, y, width, height, attach, origin
    }
  }

  private modulation(callback: (stillness: boolean) => void): Promise<SegueAnimateState> {
    const viewports = this.viewports
    const fallbackState = this.fallbackState
    const reverse = this.countercurrent
    const pos = this.pos()

    return new Promise((resolve, reject) => {
      loadWebAnimations().then(() => {
        const animateEvent: SegueAnimateState = {
          x: pos.x,
          y: pos.y,
          view: viewports,
          width: pos.width,
          height: pos.height,
          viewports: [this.relativeViewport, this.absoluteViewport],
          applets: this.appletGroup,
          reverse: reverse,
          direction: reverse ? -1 : 1,
          fallbackState,
          historyDirection: this.historyDirection,
          origin: pos.origin,
          attach: pos.attach,
          touches: this.touches,
          swipeTransitionType: this.options.swipeTransitionType ?? 'zoom',
          callback: callback
        }
        resolve(animateEvent)
      }).catch(() => {
        reject()
      })
    })
  }

  private async transform(): Promise<boolean> {
    if (!this.hasAnimation) {
      return Promise.resolve(false)
    }
    return new Promise((resolve) => {
      this.getAnimationOneSide(this.fallbackState).then((animation) => {
        this.bindHistoryBreak(() => resolve(false))
        this.modulation(resolve).then((options) => {
          if (!animation) return resolve(false)
          this.prevApplet?.willSegueHide()
          this.applet.willSegueShow()
          // Rendering and animation execution are isolated, otherwise native scroll animations will be affected
          setTimeout(() => {
            const promiseAnimation = animation(options)
            if (promiseAnimation instanceof Promise) {
              promiseAnimation.then(resolve)
            }
            // Insurance mechanism
            setTimeout(() => resolve(false), 2500)
          }, 0)
        }).catch(() => {
          resolve(false)
        })
      }).catch(() => resolve(false))
    })
  }

  private async start(): Promise<void> {
    this.application.activate(false)
    this.application.trigger('transformStart', this.appletGroup)
    const transformStart = this.applet.events.transformStart
    if (typeof transformStart === 'function') {
      if (transformStart(this.applet) === 'break') return Promise.reject()
    }
    // 0.willShow Event
    // "willShow" runs before "controls.disappearImmediately"
    this.applet.willShow()
    if (this.prevApplet) {
      this.prevApplet.willHide()
      if (this.prevApplet.controls) {
        if (this.prevApplet.swipeModel === 'default') {
          this.prevApplet.controls.activate()
        }
      }
    }
    // 1.controls
    if (this.applet.controls) {
      this.applet.controls.disappearImmediately()
      if (this.isInseparableLayer) {
        this.applet.controls.disable()
        this.applet.controls.freeze()
      } else if (!this.checkNativeAnimation()) {
        this.applet.controls.freeze()
      }
    }
    if (!this.hasAnimation || this.superSwitch) {
      /**
       * important!, Frame-type applets do not set styles.
       * When returning from history, an abnormal container height will appear.
       */
      if (this.applet.viewport && this.applet.rel === 'applet') {
        // this.applet.viewport.style.transform = 'translate(0, 0)'
        await this.applet.viewport.animate([
          { transform: 'translate(0, 0)' }
        ], {
          duration: 0,
          fill: 'forwards'
        }).finished
      }
    }
    Promise.resolve()
  }

  private async end(stillness = false): Promise<void> {
    // Return from upstream or into non-Modality
    if (this.applet.isFullscreen || this.countercurrent) {
      if (this.superSwitch) {
        await this.switchViewport()
      }
      await this.switchApplet(stillness)
    }
    // If used SwipeModel
    if (this.applet.controls) {
      if (this.applet.swipeModel === 'default') {
        this.applet.controls.freeze()
      } else {
        this.applet.controls.activate()
      }
    }
    /**
         * Obsolete
         * ------------- start -------------
         */
    // old; ios < 15
    // Keep the position of the previous pop-up window, when the iOS is less than 15, there is a bug of snap reset.
    // When a new content is inserted in the document stream, the snap resets, and the problem only occurs the first time.
    if (HasSnapReset) {
      if (this.prevHistoryStep === 1 && this.prevApplet?.modality) {
        this.prevApplet.modality.freeze()
      }
      if (this.applet.modality) {
        const applet = this.applet
        applet.modality?.activate()
      }
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
    this.applet.show()
    if (this.prevApplet) {
      this.prevApplet.hide()
    }
    const transformEnd = this.applet.events.transformEnd
    if (typeof transformEnd === 'function') {
      transformEnd(this.applet)
    }
    this.application.activate(true)
    this.application.trigger('transformEnd', this.appletGroup)
  }

  private async switchViewport() {
    await waitAllAnimations(this.relativeViewport)
    await waitAllAnimations(this.absoluteViewport)
    this.resetViewport(this.applet?.config?.free)
    await resetAllAnimations(this.relativeViewport)
    await resetAllAnimations(this.absoluteViewport)
  }

  private async switchApplet(stillness = false) {
    if (!this.prevApplet) return
    if (!stillness) {
      if (this.prevApplet.rel === 'applet') {
        /**
         * When you enter a new window and match the overlay window type, the previous one is placed as the background layer.
         * When you return from a high-level to a sub-high-level, you need to hide the high-level
         */
        const backdropType = this.applet.useControls || this.applet.config.modality
        const backdropState = (backdropType && !this.countercurrent) || (this.prevApplet.config.modality && this.fromHistoryBack)
        if (this.prevApplet.viewport) {
          await waitAllAnimations(this.prevApplet.viewport)
          this.prevApplet.viewport.style.transform = backdropState ? 'translate(0, 0)' : 'translate(0, 200%)'
          await resetAllAnimations(this.prevApplet.viewport)
        }
      }
      this.resetAppletViewport(this.applet, true)
    }
    if (this.prevApplet.viewport) {
      this.prevApplet.viewport.style.transitionDuration = '0ms'
    }
    if (this.prevApplet.config.background !== false || this.applet.config.modality) {
      this.prevApplet.hide()
    } else {
      this.destroy(this.prevApplet)
    }
    // Clear the pre-status of the backdrop Applet.
    if (this.superSwitch && this.prevPrevApplet && this.prevPrevApplet !== this.applet) {
      this.resetAppletViewport(this.prevPrevApplet, false)
    }
  }
}

export {
  SegueSwitch
}
