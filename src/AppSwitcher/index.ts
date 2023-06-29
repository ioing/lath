import { requestIdleCallback, setTimeout } from '../lib/util'
import { SmoothScroller } from '../Scroll'
import loadWebAnimations from '../lib/webAnimations/load'
import clearAnimations from '../lib/webAnimations/clear'
import resetAllAnimations from '../lib/webAnimations/reset'
import allAnimationsFinish from '../lib/webAnimations/finish'
import {
  switcherCSSText,
  snapWrapper2CSSText,
  snapWrapper3CSSText,
  itemImgWrapperCSSText,
  itemViewCSSText,
  itemImgCSSText,
  itemImgCoverCSSText,
  itemInfoCSSText,
  itemTitleCSSText,
  itemCloseBtnCSSText,
  itemCloseBtnX1ShapeCSSText,
  itemCloseBtnX2ShapeCSSText
} from './cssText'
import { Application, Applet } from '../types'

const EASE = {
  smoothAcceleration: 'cubic-bezier(0.52, 0.16, 0.24, 1)',
  quickDeceleration: 'cubic-bezier(0.32, 0.08, 0.24, 1)'
}

const supportedBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)')


interface SwitcherOptions {
  readonly: boolean
}

class AppSwitcher {
  public application: Application
  public relativeViewport: HTMLElement
  public absoluteViewport: HTMLElement
  public fixedViewport: HTMLElement
  public switcher!: HTMLElement
  public snapWrapper!: HTMLElement
  public scroll!: SmoothScroller
  public progressName = ''
  public deleteMap: { [key: string]: number } = {}
  public options: SwitcherOptions = {
    readonly: false
  }
  constructor(application: Application) {
    const { relativeViewport, absoluteViewport, fixedViewport } = application.segue
    this.relativeViewport = relativeViewport
    this.absoluteViewport = absoluteViewport
    this.fixedViewport = fixedViewport
    this.application = application
    this.delayDynamicImport()
  }
  public bindResize(): void {
    const close = () => {
      this.close()
      window.removeEventListener('resize', close)
      window.removeEventListener('orientationchange', close)
    }
    window.addEventListener('resize', close)
    window.addEventListener('orientationchange', close)
  }
  public async open(options?: SwitcherOptions): Promise<void> {
    if (this.progressName === 'open') return
    this.progressName = 'open'
    if (options) {
      this.options = options
    }
    await loadWebAnimations()
    await this.createAppSwitcher()
    if (!supportedBackdropFilter) {
      await this.blurBackgroundImage()
    }
    this.switcher.style.opacity = '1'
    this.bindResize()
    setTimeout(() => {
      if (this.progressName === 'close') return
      this.progressName = ''
    }, 400)
  }
  public async close(): Promise<void> {
    if (this.progressName === 'close') return
    this.progressName = 'close'
    if (!supportedBackdropFilter) {
      await this.focusBackgroundImage()
    }
    this.switcher.style.opacity = '0'
    setTimeout(() => {
      if (this.progressName === 'open') return
      this.progressName = ''
      if (this.switcher.parentElement !== this.fixedViewport) return
      this.fixedViewport.removeChild(this.switcher)
    }, 400)
  }
  public async createAppSwitcher(): Promise<void> {
    this.switcher = document.createElement('applet-switcher')
    this.switcher.style.cssText = switcherCSSText
    this.snapWrapper = document.createElement('applet-switcher-snap')
    this.snapWrapper.style.cssText = this.switcher.offsetWidth > 800 ? snapWrapper3CSSText : snapWrapper2CSSText
    this.scroll = new SmoothScroller(this.snapWrapper)
    const applets = this.application.applets
    const activityApplet = this.getActiveApplet()
    const activitySubAppletIds = activityApplet?.parentApplet?.allSubAppletIds
    for (const id in applets) {
      const applet = applets[id]
      const color = applet.color
      const isActive = activitySubAppletIds?.includes(id)
      if (this.deleteMap[applet.id] === applet.createTime) continue
      if (applet.rel !== 'applet' || applet.isModality || applet.slide) continue
      if (applet.view) {
        const itemView = document.createElement('applet-switcher-item')
        const itemImgWrapper = document.createElement('div')
        const itemImg = document.createElement('div')
        const itemIcon = document.createElement('div')
        const itemInfo = document.createElement('div')
        const itemTitle = document.createElement('div')
        itemView.style.cssText = itemViewCSSText
        const posterCssText = applet.config.poster ? `
          background-image: url(${applet.config.poster});
          background-size: cover;
        ` : ''
        itemImgWrapper.style.cssText = `
          ${itemImgWrapperCSSText}
          background: ${color};
          ${posterCssText}
        `
        // absolute is used to fix 'border-radius' defects in ios
        itemImg.style.cssText = `
          ${itemImgCSSText}
          background: ${color};
        `
        itemInfo.style.cssText = itemInfoCSSText
        itemIcon.style.cssText = applet.config.icon ? `
          width: 16px;
          height: 16px;
          background-image: url(${applet.config.icon});
        ` : 'display: none;'
        itemTitle.style.cssText = itemTitleCSSText
        itemTitle.innerText = applet.config.title || applet.id
        itemInfo.appendChild(itemIcon)
        itemInfo.appendChild(itemTitle)
        itemImgWrapper.appendChild(itemImg)
        itemView.appendChild(itemImgWrapper)
        itemView.appendChild(itemInfo)
        this.snapWrapper.appendChild(itemView)
        this.switcher.appendChild(this.snapWrapper)
        this.fixedViewport.appendChild(this.switcher)
        if (applet.id === activityApplet?.id) {
          await this.setActivityItem(applet, itemImgWrapper, itemImg)
        } else {
          if (!this.options.readonly && !isActive && applet.config.background !== true && !applet.isPresetAppletsView) {
            const itemCloseBtn = document.createElement('div')
            const itemCloseBtnX1 = document.createElement('div')
            const itemCloseBtnX2 = document.createElement('div')
            itemCloseBtn.style.cssText = itemCloseBtnCSSText
            itemCloseBtnX1.style.cssText = itemCloseBtnX1ShapeCSSText
            itemCloseBtnX2.style.cssText = itemCloseBtnX2ShapeCSSText
            itemCloseBtn.appendChild(itemCloseBtnX1)
            itemCloseBtn.appendChild(itemCloseBtnX2)
            itemImgWrapper.appendChild(itemCloseBtn)
            itemCloseBtn.addEventListener('click', () => {
              if (applet.parentApplet) {
                const allSubAppletIds = applet.parentApplet.allSubAppletIds
                for (const subAppletId of allSubAppletIds) {
                  this.application.applets[subAppletId]?.destroy()
                }
                applet.parentApplet.destroy()
              } else {
                applet.destroy()
              }
              this.deleteItem(itemView)
              this.deleteMap[applet.id] = applet.createTime
            }, false)
          }
          const showNormalItem = () => {
            requestIdleCallback(() => {
              this.setNormalItem(applet, itemImg)
            })
          }
          const intersectionObserver = new IntersectionObserver(function (entries) {
            if (entries[0].intersectionRatio < 0) return
            intersectionObserver.unobserve(itemImgWrapper)
            showNormalItem()
          })
          // start observing
          intersectionObserver.observe(itemImgWrapper)
        }
        this.bindItemClick(applet, itemImgWrapper, itemImg)
      }
    }
  }
  public deleteItem(elementToDelete: HTMLElement): void {
    const elementPositions = []
    const gridList = Array.from(this.snapWrapper.children) as HTMLElement[]
    const indexToDelete = gridList.indexOf(elementToDelete)
    const nextElements = gridList.slice(indexToDelete).filter(el => !el.getAttribute('applet-to-delete'))

    for (let i = 1; i <= nextElements.length - 1; i++) {
      const currentEl = nextElements[i - 1]
      const nextElement = nextElements[i]
      const currentElRect = currentEl.getBoundingClientRect()
      elementPositions.push({
        x: currentElRect.x - nextElement.offsetLeft,
        y: currentElRect.y - nextElement.offsetTop
      })
    }
    elementToDelete.setAttribute('applet-to-delete', 'true')
    elementToDelete.style.transform = 'translate3d(-100vw, 0, 0)'
    for (let i = 1; i <= nextElements.length - 1; i++) {
      const nextElement = nextElements[i]
      const pos = elementPositions[i - 1]
      nextElement.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
    }
  }
  private bindItemClick(applet: Applet, itemImgWrapper: HTMLElement, itemImg: HTMLElement) {
    itemImg.addEventListener('click', () => {
      if (this.progressName === 'close') return
      this.progressName = 'close'
      this.restoreToItem(applet, itemImgWrapper, itemImg)
    })
  }
  private async setNormalItem(applet: Applet, itemImg: HTMLElement): Promise<void> {
    applet.captureShot(Date.now() - applet.visitTime >= 120000 ? true : false).then(async (canvas) => {
      itemImg.appendChild(canvas)
      await canvas.animate([
        { opacity: 0 },
        { opacity: .1 }
      ], {
        duration: 0,
        easing: EASE.smoothAcceleration,
        fill: 'forwards'
      }).finished
      canvas.animate([
        { opacity: .1 },
        { opacity: 1 }
      ], {
        duration: 300,
        easing: EASE.smoothAcceleration,
        fill: 'forwards'
      }).play()
    }).catch((e) => {
      console.warn(e)
    })
  }
  private async setActivityItem(applet: Applet, itemImgWrapper: HTMLElement, itemImg: HTMLElement): Promise<void> {
    const color = applet.color
    const imgWidth = itemImgWrapper.offsetWidth
    const scale = imgWidth / this.switcher.offsetWidth
    const originalCssText = itemImg.style.cssText
    const imgHeight = itemImgWrapper.offsetHeight
    const offsetTop = itemImgWrapper.offsetTop
    const offsetLeft = itemImgWrapper.offsetLeft
    itemImg.style.cssText = `
      ${itemImgCoverCSSText}
      z-index: 3;
      background: ${color};
      border-radius: ${16 / scale}px;
    `
    this.switcher.appendChild(itemImg)
    itemImg.appendChild(await applet.captureShot())
    if (this.progressName === 'close') return
    await itemImg.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration: 100,
      easing: EASE.smoothAcceleration,
      fill: 'forwards'
    }).finished
    this.snapWrapper.animate({
      transform: `translate3d(0, 0, 0) scale(.9)`,
      opacity: .5
    }, {
      duration: 0,
      fill: 'forwards'
    }).finished.then(async () => {
      await Promise.all([
        itemImg.animate({
          height: `${imgHeight / scale}px`
        }, {
          duration: 460,
          easing: EASE.smoothAcceleration,
          fill: 'forwards'
        }).finished,
        itemImg.animate({
          transform: `translate3d(${offsetLeft}px, ${offsetTop}px, 0) scale(${scale})`,
        }, {
          duration: 360,
          easing: EASE.quickDeceleration,
          fill: 'forwards'
        }).finished,
        this.snapWrapper.animate({
          transform: `translate3d(0, 0, 0) scale(1)`
        }, {
          duration: 440,
          easing: EASE.smoothAcceleration,
          fill: 'forwards'
        }).finished,
        this.snapWrapper.animate({
          opacity: 1
        }, {
          duration: 360,
          easing: EASE.smoothAcceleration,
          fill: 'forwards'
        }).finished
      ])
      if (this.progressName === 'close') return
      itemImg.style.cssText = originalCssText
      clearAnimations(itemImg)
      clearAnimations(itemImgWrapper)
      itemImgWrapper.appendChild(itemImg)
      this.snapWrapper.style.overflowY = 'scroll'
      this.snapWrapper.style.scrollSnapType = 'y mandatory'
      if (this.snapWrapper.offsetHeight <= offsetTop) {
        requestIdleCallback(() => {
          this.scroll.snapTo(0, offsetTop)
        })
      }
    })
  }
  private async restoreToItem(applet: Applet, itemImgWrapper: HTMLElement, itemImg: HTMLElement): Promise<void> {
    const offsetTop = itemImgWrapper.offsetTop
    const offsetLeft = itemImgWrapper.offsetLeft
    const imgWidth = itemImgWrapper.offsetWidth
    const imgHeight = itemImgWrapper.offsetHeight
    const scale = imgWidth / this.switcher.offsetWidth
    const color = applet.color
    this.switcher.appendChild(itemImg)
    itemImg.style.cssText = `
      ${itemImgCoverCSSText}
      z-index: 5;
      height: ${imgHeight / scale}px;
      background: ${color};
      border-radius: ${16 / scale}px;
      transform: translate3d(${offsetLeft}px, ${offsetTop}px, 0px) scale(${scale});
    `
    if (this.progressName === 'open') return
    if (!supportedBackdropFilter) {
      this.application.segue.resetBaseStyle(
        `filter: blur(20px);`
      )
    }
    await Promise.all([
      this.application.to(applet.id, applet.param, undefined, undefined, true),
      itemImg.animate({
        transform: 'translate3d(0, 0, 0) scale(1)'
      }, {
        duration: 400,
        easing: EASE.quickDeceleration,
        fill: 'forwards'
      }).finished,
      itemImg.animate({
        height: `${this.switcher.offsetHeight}px`
      }, {
        duration: 100,
        easing: EASE.smoothAcceleration,
        fill: 'forwards'
      }).finished,
      itemImg.animate({
        borderRadius: '0px'
      }, {
        duration: 800,
        easing: EASE.smoothAcceleration,
        fill: 'forwards'
      }).finished,
      this.snapWrapper.animate({
        transform: 'translate3d(0, 0, 0) scale(.9)'
      }, {
        duration: 440,
        easing: EASE.smoothAcceleration,
        fill: 'forwards'
      }).finished,
      this.snapWrapper.animate({
        opacity: .5
      }, {
        duration: 200,
        easing: EASE.smoothAcceleration,
        fill: 'forwards'
      }).finished
    ])
    if (!supportedBackdropFilter) {
      this.application.segue.resetBaseStyle()
      this.application.segue.appletGroup.forEach((applet) => {
        if (applet.viewport) {
          applet.viewport.style.filter = 'none'
          resetAllAnimations(applet.viewport)
        }
      })
    }
    this.progressName = ''
    this.close()
  }
  private getActiveApplet(): Applet | undefined {
    const activityApplet = this.application.activityApplet
    if (activityApplet?.slide) {
      return activityApplet.subApplet
    }
    return activityApplet
  }
  private async blurBackgroundImage(blur = true): Promise<void> {
    await allAnimationsFinish(this.relativeViewport)
    await allAnimationsFinish(this.absoluteViewport)
    this.relativeViewport.style.filter = this.absoluteViewport.style.filter = blur ? 'blur(20px)' : 'none'
    await resetAllAnimations(this.relativeViewport)
    await resetAllAnimations(this.absoluteViewport)
  }
  private async focusBackgroundImage(): Promise<void> {
    await this.blurBackgroundImage(false)
  }
  private delayDynamicImport(): void {
    import('../Applet/captureShot').catch((e) => {
      console.warn(e)
    })
  }
}

export {
  AppSwitcher
}