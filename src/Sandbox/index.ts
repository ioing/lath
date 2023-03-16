class Sandbox {
  public sandbox: HTMLIFrameElement
  public setting?: string
  private readonly blankURL = 'about:blank'
  constructor(uri?: string, setting?: string, type: 'src' | 'source' = 'src') {
    const sandbox = this.sandbox = document.createElement('iframe')
    sandbox[type === 'source' && uri ? 'srcdoc' : 'src'] = uri || this.blankURL
    sandbox.style.display = 'none'
    this.setting = setting
    return this
  }
  get window() {
    return this.sandbox.contentWindow as Window
  }
  get document() {
    return this.sandbox.contentDocument as Document
  }
  get origin() {
    return this.src === this.blankURL ? null : this.src
  }
  set src(src: string) {
    this.sandbox.src = src
  }
  public setOnUnload(onunload: null | ((this: WindowEventHandlers, ev: Event) => unknown)) {
    try {
      this.window.onunload = onunload
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
  public setOnLoad(onload: (this: GlobalEventHandlers, ev: Event) => unknown) {
    try {
      this.sandbox.onload = onload
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
  public setOnError(onerror: OnErrorEventHandler) {
    try {
      this.sandbox.onerror = onerror
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
  public set(allow = this.setting): void {
    if (allow === undefined) return
    this.sandbox.setAttribute('sandbox', allow)
  }
  public reset(allow?: string): this {
    this.exit()
    this.set(allow)
    return this
  }
  public open(): this {
    this.document?.open()
    return this
  }
  public write(context = '<head><meta charset="utf-8"></head>'): this {
    context = '<!DOCTYPE html>' + context
    this.document?.write(context)
    return this
  }
  public close(): this {
    this.document?.close()
    return this
  }
  public append(context: string | undefined): void {
    this.open()
    this.write(context)
    this.close()
  }
  public enter(container: HTMLElement): void {
    this.set()
    container.appendChild(this.sandbox)
  }
  public exit(): void {
    const parentNode = this.sandbox.parentNode as HTMLElement
    parentNode && parentNode.removeChild(this.sandbox)
  }
}

export {
  Sandbox
}
