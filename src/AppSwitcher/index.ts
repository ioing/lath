import { requestAnimationFrame, requestIdleCallback, setTimeout } from '../lib/util'
import { SmoothScroller } from '../Scroll'
import { Application, Applet } from '../types'
import {
  switcherCSSText,
  snapWrapper2CSSText,
  snapWrapper3CSSText,
  itemImgWrapperCSSText,
  itemViewCSSText,
  itemImgCSSText,
  itemImgCoverCSSText,
  itemInfoCSSText,
  itemTitleCSSText
} from './cssText'

class AppSwitcher {
  public application: Application
  public relativeViewport: HTMLElement
  public absoluteViewport: HTMLElement
  public fixedViewport: HTMLElement
  public switcher!: HTMLElement
  public snapWrapper!: HTMLElement
  public scroll!: SmoothScroller
  public progressName = ''
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
  public async open(): Promise<void> {
    if (this.progressName === 'open') return
    this.progressName = 'open'
    await this.createAppSwitcher()
    this.blurBackgroundImage()
    this.switcher.style.opacity = '1'
    this.bindResize()
    setTimeout(() => {
      if (this.progressName === 'close') return
      this.progressName = ''
    }, 400)
  }
  public close(): void {
    if (this.progressName === 'close') return
    this.progressName = 'close'
    this.focusBackgroundImage()
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
    for (const id in applets) {
      const applet = applets[id]
      const color = applet.color
      if (applet.rel !== 'applet' || applet.isModality) continue
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
          const showNormalItem = () => {
            requestIdleCallback(() => {
              this.setNormalItem(applet, itemImg)
            })
          }
          const intersectionObserver = new IntersectionObserver(function (entries) {
            if (entries[0].intersectionRatio <= 0) return
            intersectionObserver.unobserve(itemImgWrapper)
            showNormalItem()
          })
          // start observing
          intersectionObserver.observe(itemImgWrapper)
        }
        this.bindItemClick(applet, itemImgWrapper, itemImg)
      }
    }
    this.snapWrapper.style.transform = 'translate3d(0, 0, 0) scale(.9)'
    this.snapWrapper.style.opacity = '.5'
    setTimeout(() => {
      if (this.progressName === 'close') return
      this.snapWrapper.style.transition = 'transform .44s cubic-bezier(0.52, 0.16, 0.24, 1), opacity .36s cubic-bezier(0.52, 0.16, 0.24, 1)'
      this.snapWrapper.style.transform = 'translate3d(0, 0, 0) scale(1)'
      this.snapWrapper.style.opacity = '1'
    }, 100)
  }
  private bindItemClick(applet: Applet, itemImgWrapper: HTMLElement, itemImg: HTMLElement) {
    itemImg.addEventListener('click', () => {
      if (this.progressName === 'close') return
      this.progressName = 'close'
      this.restoreToItem(applet, itemImgWrapper, itemImg)
    })
  }
  private async setNormalItem(applet: Applet, itemImg: HTMLElement): Promise<void> {
    applet.captureShot(Date.now() - applet.visitTime >= 120000 ? true : false).then((canvas) => {
      itemImg.appendChild(canvas)
      canvas.style.opacity = '.1'
      requestAnimationFrame(() => {
        canvas.style.transition = 'opacity .3s cubic-bezier(0.52, 0.16, 0.24, 1)'
        canvas.style.opacity = '1'
      })
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
    const { Animate } = await import('../Animate')
    const itemImgAnimate = new Animate(itemImg)
    itemImg.style.cssText = `
      ${itemImgCoverCSSText}
      z-index: 3;
      background: ${color};
      border-radius: ${16 / scale}px;
      transition: height .46s cubic-bezier(0.52, 0.16, 0.24, 1), transform .36s cubic-bezier(0.32, 0.08, 0.24, 1), border-radius .2s cubic-bezier(0.52, 0.16, 0.24, 1)
    `
    this.switcher.appendChild(itemImg)
    itemImg.appendChild(await applet.captureShot())
    if (this.progressName === 'close') return
    itemImgAnimate.height(imgHeight / scale).to(offsetLeft, offsetTop, 0).scale(scale).end(() => {
      if (this.progressName === 'close') return
      itemImg.style.cssText = originalCssText
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
    const { Animate } = await import('../Animate')
    const itemImgAnimate = new Animate(itemImg)
    const snapWrapperAnimate = new Animate(this.snapWrapper)
    this.switcher.appendChild(itemImg)
    itemImg.style.cssText = `
      ${itemImgCoverCSSText}
      z-index: 5;
      height: ${imgHeight / scale}px;
      background: ${color};
      border-radius: ${16 / scale}px;
      transform: translate3d(${offsetLeft}px, ${offsetTop}px, 0px) scale(${scale});
      transition: transform .4s cubic-bezier(0.32, 0.08, 0.24, 1), height .1s cubic-bezier(0.52, 0.16, 0.24, 1), border-radius .8s cubic-bezier(0.52, 0.16, 0.24, 1);
    `
    this.snapWrapper.style.transition = 'transform .44s cubic-bezier(0.52, 0.16, 0.24, 1), opacity .2s cubic-bezier(0.52, 0.16, 0.24, 1)'
    if (this.progressName === 'open') return
    await Promise.all([
      snapWrapperAnimate.to(0, 0, 0).scale(.9).opacity(.5).end(),
      itemImgAnimate.to(0, 0, 0).scale(1).height(this.switcher.offsetHeight).borderRadius('0px').end()
    ])
    const startTime = Date.now()
    this.application.to(applet.id, applet.param, undefined, undefined, true).then(() => {
      const processTime = Date.now() - startTime
      setTimeout(() => {
        this.progressName = ''
        this.close()
      }, processTime > 200 ? 0 : 400 - processTime)
    })
  }
  private getActiveApplet() {
    const activityApplet = this.application.activityApplet
    if (activityApplet?.slide) {
      return this.application.applets[activityApplet.slide.activeId]
    }
    return activityApplet
  }
  private blurBackgroundImage() {
    this.relativeViewport.style.filter = 'blur(20px)'
    this.absoluteViewport.style.filter = 'blur(20px)'
  }
  private focusBackgroundImage() {
    this.relativeViewport.style.filter = 'none'
    this.absoluteViewport.style.filter = 'none'
  }
  private delayDynamicImport(): void {
    import('../Applet/captureShot').catch((e) => {
      console.warn(e)
    })
    import('../Animate').catch((e) => {
      console.warn(e)
    })
  }
}

export {
  AppSwitcher
}