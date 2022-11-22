import { AppletPrefetch } from './Prefetch'

class AppletEventTarget extends AppletPrefetch {
  public borderHolder: HTMLElement[] = []
  public attachEvent(): void {
    this.registerBorderTouch()
    this.bindOverscrollHistoryNavigation()
    this.registerTapStatusBarToScrollToTop()
    this.registerPullToRefresh()
  }

  public scrollToTop(): void {
    const scroller = this.getMainScroller()
    if (!scroller) return
    import('../Scroll').then(({ SmoothScroller }) => {
      const smoothScroller = new SmoothScroller(scroller)
      smoothScroller.scrollTo(0, 0)
    }).catch((e) => {
      console.warn(e)
    })
  }

  private registerPullToRefresh(): void {
    if (!this.config.pullToRefresh) return
    if (!this.application.pullRefreshHolder.holder) {
      this.application.on('pullToRefreshAvailable', () => {
        this.registerPullToRefresh()
      })
      return
    }
    const holder = this.application.pullRefreshHolder.holder
    const spinner = this.application.pullRefreshHolder.spinner
    const holdLayer = this.application.pullRefreshHolder.holdLayer
    const scroller = this.getMainScroller(this.config.pullToRefreshTargetScrollId)
    if (!scroller) return
    import('../pullToRefresh').then((PullRefresh) => {
      PullRefresh.registerPullDownEvent(this.self, scroller as HTMLElement, holder, spinner, holdLayer)
    }).catch((e) => {
      console.warn(e)
    })
  }

  private registerTapStatusBarToScrollToTop(): void {
    if (!this.config.tapStatusBarToScrollToTop) return
    const topHolder = this.borderHolder[0]
    topHolder.addEventListener('touchend', () => {
      this.scrollToTop()
    })
  }

  private getMainScroller(id: string | undefined = this.config.mainScrollId): HTMLElement | null | undefined {
    let scroller: HTMLElement | null | undefined
    if (this.viewType === 'shadow') {
      scroller = id ? (this.view?.shadowRoot?.getElementById(id) || document.getElementById(id)) : this.contentView
    } else if (this.sameOrigin) {
      const sandboxWindow = this.sandbox?.window
      scroller = id ? sandboxWindow?.document.getElementById(id) : sandboxWindow?.document.body
    }
    return scroller
  }

  private bindOverscrollHistoryNavigation(): void {
    const updateTriggerTime = (types: string[], event: TouchEvent) => {
      if (event.type !== 'touchmove') return
      if (types.includes('left') || types.includes('right') || types.includes('wipe')) {
        this.application.overscrollHistoryNavigation.moment = Date.now()
        this.application.overscrollHistoryNavigation.type = types.join(' ')
      }
    }
    this.on('touchBorder', updateTriggerTime)
  }

  private addBorderPanMoveHolder(viewport: HTMLElement): HTMLDivElement[] {
    const threshold = this.config.borderTouchSize ?? 15
    const topHolder = document.createElement('div')
    const rightHolder = document.createElement('div')
    const bottomHolder = document.createElement('div')
    const leftHolder = document.createElement('div')
    const mainHolder = document.createElement('div')
    const baseStyle = 'position: absolute; z-index: 3;'
    topHolder.style.cssText = `${baseStyle} top: 0; right: 0; left: 0; height: env(safe-area-inset-top); mini-height: ${threshold}px;`
    rightHolder.style.cssText = `${baseStyle} top: 0; right: 0; bottom: 0; z-index: 3; width: ${threshold}px;`
    bottomHolder.style.cssText = `${baseStyle} right: 0; bottom: 0; left: 0; z-index: 3; height: ${threshold}px;`
    leftHolder.style.cssText = `${baseStyle} top: 0; bottom: 0; left: 0; z-index: 3; width: ${threshold}px;`
    mainHolder.style.cssText = `display: none; ${baseStyle} top: 0; right: 0; bottom: 0; left: 0; z-index: 4;`
    viewport.appendChild(topHolder)
    viewport.appendChild(rightHolder)
    viewport.appendChild(bottomHolder)
    viewport.appendChild(leftHolder)
    viewport.appendChild(mainHolder)

    return this.borderHolder = [topHolder, rightHolder, bottomHolder, leftHolder, mainHolder]
  }

  private getTouchBorderType = (event: TouchEvent): string[] => {
    const viewport = this.viewport as HTMLElement
    const contentWidth = viewport.offsetWidth
    const contentHeight = viewport.offsetHeight
    const touches = event.touches[0]
    const x = touches.clientX
    const y = touches.clientY
    const types: string[] = []
    const threshold = this.config.borderTouchSize ?? 100
    if (x <= threshold) {
      types.push('left')
    } else if (x >= contentWidth - threshold) {
      types.push('right')
    }
    if (y <= threshold) {
      types.push('top')
    } else if (y >= contentHeight - threshold) {
      types.push('bottom')
    }
    return types
  }

  private registerBorderHolderTouch(): void {
    const [topHolder, rightHolder, bottomHolder, leftHolder, mainHolder] = this.addBorderPanMoveHolder(this.viewport as HTMLElement)
    const touchTypes: string[] = []
    const contentBinder = mainHolder.addEventListener
    const contentUnBinder = mainHolder.removeEventListener
    const trigger = (event: TouchEvent) => {
      this.trigger('touchBorder', touchTypes, event)
    }
    const bindPlaceholder = (event: TouchEvent): void => {
      touchTypes.length = 0
      if (event.target === topHolder) {
        touchTypes.push('top')
      } else if (event.target === rightHolder) {
        touchTypes.push('right')
      } else if (event.target === bottomHolder) {
        touchTypes.push('bottom')
      } else if (event.target === leftHolder) {
        touchTypes.push('left')
      }
      mainHolder.style.display = 'block'
      contentBinder('touchmove', trigger, true)
      contentBinder('touchend', trigger, true)
      contentBinder('touchcancel', trigger, true)
    }
    const unbindPlaceholder = (): void => {
      mainHolder.style.display = 'none'
      contentUnBinder('touchmove', trigger, true)
      contentUnBinder('touchend', trigger, true)
      contentUnBinder('touchcancel', trigger, true)
    }
    const binder = (holder: HTMLElement): void => {
      const holderBinder = holder.addEventListener
      holderBinder('touchstart', bindPlaceholder, true)
      holderBinder('touchmove', bindPlaceholder, true)
      holderBinder('touchcancel', unbindPlaceholder, true)
      holderBinder('touchend', unbindPlaceholder, true)
    }
    binder(topHolder)
    binder(rightHolder)
    binder(bottomHolder)
    binder(leftHolder)
  }

  private registerBorderTouch(): void {
    if (this.sandbox && !this.sameOrigin) return this.registerBorderHolderTouch()
    const target = this.sandbox?.window?.document || this.viewport as HTMLElement
    const touchTypes: string[] = []
    const trigger = ((event: TouchEvent) => {
      this.trigger('touchBorder', touchTypes, event)
      if (event.type === 'touchend' || event.type === 'touchcancel') {
        target.removeEventListener('touchmove', trigger, true)
        target.removeEventListener('touchend', trigger, true)
        target.removeEventListener('touchcancel', trigger, true)
      }
    }) as EventListener
    const listener = ((event: TouchEvent): void => {
      touchTypes.length = 0
      touchTypes.push(...this.getTouchBorderType(event))
      if (this.transforming) {
        touchTypes.push('wipe')
      }
      if (touchTypes.length > 0) {
        target.addEventListener('touchmove', trigger, true)
        target.addEventListener('touchend', trigger, true)
        target.addEventListener('touchcancel', trigger, true)
      }
    }) as EventListener
    target.addEventListener('touchstart', listener, true)
  }
}

export {
  AppletEventTarget
}
