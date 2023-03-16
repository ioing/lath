import { AppletLifeCycle } from './LifeCycle'
import { Sandbox } from '../Sandbox'
import { requestIdleCallback } from '../lib/util'

class AppletPrefetch extends AppletLifeCycle {
  public dependenciesLoad(uri?: string, type: 'src' | 'source' = 'src'): Promise<Event> {
    return new Promise((resolve, reject) => {
      const head = document.head
      const sandbox = new Sandbox(uri, '', type)
      sandbox.setOnLoad((e) => {
        // wait async script
        setTimeout(() => {
          sandbox.exit()
        }, 2000)
        resolve(e)
      })
      sandbox.setOnError((e) => {
        sandbox.exit()
        reject(e)
      })
      sandbox.enter(head)
    })
  }

  public async preload(): Promise<void> {
    return this.dependenciesLoad(this.uri || await this.source, this.uri ? 'src' : 'source').then(() => {
      this.status.preload = true
      this.events?.preload(this.self)
      this.trigger('preload')
    })
  }

  public prefetch(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.prefetchStatic(this.resources.script, 'script'),
        this.prefetchStatic(this.resources.image, 'image'),
        this.prefetchStatic(this.resources.worker, 'worker'),
        this.prefetchStatic(this.resources.video, 'video'),
        this.prefetchStatic(this.resources.audio, 'audio'),
        this.prefetchStatic(this.resources.font, 'font'),
        this.prefetchStatic(this.resources.style, 'style'),
        this.prefetchStatic(this.resources.html, 'document')
      ]).then(() => {
        this.status.prefetch = true
        this.trigger('prefetch')
        resolve(true)
      }).catch(reject)
    })
  }

  public prefetchStatic(list: string[] = [], as = 'script'): Promise<(string | undefined | Event)[]> {
    return new Promise((resolve, reject) => {
      Promise.all([].concat(list as []).map(url => this.prelink(url, 'preload', as))).then(resolve).catch(reject)
    })
  }

  public prelink(url: string, rel: 'prefetch' | 'prerender' | 'preload' = 'preload', as = 'worker | video | audio | font | script | style | image | document'): Promise<Event | string | undefined> {
    if (!url) return Promise.resolve(undefined)
    return new Promise((resolve, reject) => {
      const load = () => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = url
        link.as = as
        link.onload = resolve
        link.onerror = reject
        if (rel === 'preload' && as === 'document') {
          this.dependenciesLoad(url)
        }
        if (!link.relList?.supports(rel)) {
          return resolve(undefined)
        }
        document.getElementsByTagName('head')[0].appendChild(link)
        resolve(undefined)
      }
      requestIdleCallback(load, { timeout: 15000 })
    })
  }

  public async prerender(): Promise<void> {
    if (this.status.preload || this.status.prerender) {
      return Promise.resolve()
    }
    await this.preload()
    await this.prefetch()

    return Promise.resolve()
  }
}

export {
  AppletPrefetch
}
