import { Applet } from './Applet'
import { Application } from './Application'
import { Segue } from './Segue'
import { DefineApplet } from './Define/DefineApplet'
import { Animate } from './Animate'
import { Slide } from './Slide'
import { Modality } from './Modality'
import { AppSwitcher } from './AppSwitcher'
import { AppletControls } from './AppletControls'
import { SmoothScroller } from "./Scroll"

type FilterOptional<T> = Pick<
  T,
  Exclude<
    {
      [K in keyof T]: T extends Record<K, T[K]> ? K : never
    }[keyof T],
    undefined
  >
>
type FilterNotOptional<T> = Pick<
  T,
  Exclude<
    {
      [K in keyof T]: T extends Record<K, T[K]> ? never : K
    }[keyof T],
    undefined
  >
>
type PartialEither<T, K> = { [P in Exclude<keyof FilterOptional<T>, K>]-?: T[P] } &
  { [P in Exclude<keyof FilterNotOptional<T>, K>]?: T[P] } &
  { [P in Extract<keyof T, K>]?: undefined }
type TObject = {
  [name: string]: unknown
}
type EitherOr<O extends TObject, L extends string, R extends string> = (
  PartialEither<Pick<O, L | R>, L> |
  PartialEither<Pick<O, L | R>, R>
) & Omit<O, L | R>
type AppletApplyMaybeOptions = 'smart-setTimeout' | 'proxy-link' | 'tap-highlight'
type AppletApplyOptions = Array<AppletApplyMaybeOptions>
type AppletApplyOptionsParam = {
  'tap-highlight'?: {
    selector: string
  }
}
type AppletSettings = AppletManifest | (() => Promise<AppletManifest>)
type AppletAllTypeSettings = AppletUsualManifest | (() => Promise<AppletUsualManifest>)
type SystemAppletSettings = SystemAppletManifest | (() => Promise<SystemAppletManifest>)
type FrameworksAppletSettings = FrameworksAppletManifest
type AnimationFunction = (e: SegueAnimateState) => undefined | Promise<boolean>
type AnimationPrestType = 'inherit'
  | 'fade' | 'zoom' | 'popup' | 'grow'
  | 'flip' | 'flip-left' | 'flip-down' | 'flip-right' | 'flip-up'
  | 'slide' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
type SwipeTransitionType = 'zoom' | 'slide'
type SwipeModelType = boolean | 'default'
type AnimationConfig = AnimationPrestType | boolean | Array<AnimationPrestType> | AnimationFunction | [AnimationFunction, AnimationFunction]
type ApplicationSafeAreaValue = string | Array<string>
type GlobalCSSVariables = { [key: string]: string }
type SandboxOptions = Array<'allow-same-origin' | 'allow-scripts' | 'allow-forms' | 'allow-modals' | 'allow-orientation-lock' | 'allow-popups'
  | 'allow-pointer-lock' | 'allow-popups-to-escape-sandbox' | 'allow-presentation' | 'allow-top-navigation' | 'allow-top-navigation-by-user-activation'
  | 'allow-downloads-without-user-activation' | 'allow-storage-access-by-user-activation' | 'allow-top-navigation-by-user-activation' | string>
type PushWindowOptions = [
  url: string,
  title: string,
  preset: string,
  cloneAs?: string,
  touches?: SegueActionOrigin
]
type SegueBackType = 'controls' | undefined
type SlidingState = { readonly x: number, readonly y: number, readonly xIndex: number, readonly yIndex: number }
type TriggerEventArgsMap = {
  safeAreaChange: [ApplicationSafeAreaValue],
  globalCSSVariablesChange: [GlobalCSSVariables],
  transformStart: [Applet[]],
  transformEnd: [Applet[]],
  transition: [degree: number, applets: Applet[]],
  systemDidMount: [Applet],
  frameworksDidMount: [Applet],
  firstAppletDidMount: [],
  touchBorder: [types: string[], event: TouchEvent],
  prerenderComplete: [],
  load: [],
  loadError: [],
  importSlideViewError: [],
  runSlideViewError: [],
  preload: [],
  prefetch: [],
  refreshing: [],
  show: [],
  hide: [],
  willShow: [],
  willHide: [],
  willSegueShow: [],
  willSegueHide: [],
  active: [],
  frozen: [],
  slideEnter: [Applet],
  slideOut: [Applet],
  sliding: [SlidingState],
  pullToRefreshAvailable: [],
  pullToRefreshRequest: [],
  pullToRefreshReady: [],
  pullToRefreshRelease: [],
  pullToRefreshCancel: [],
  destroy: [],
  exit: [{ backoutCount: number }],
  back: [Applet],
  error: [e: unknown]
}
type TriggerEventTypes = keyof TriggerEventArgsMap
type TriggerEventCallbackArgs<N extends TriggerEventTypes> = TriggerEventArgsMap[N]
type TriggerEventCallback<N extends TriggerEventTypes> = (...args: TriggerEventArgsMap[N]) => void
type TriggerEventTypesCallbacks = Record<TriggerEventTypes, TriggerEventCallback<keyof TriggerEventArgsMap>>
type SlideViewApplets = Array<{
  id: string,
  activate: 'lazy' | 'instant' | 'passive'
}>
type SlideViewSnapType = 'x' | 'y' | 'both'
type ModalityType = 'paper' | 'sheet' | 'overlay'
type SheetOptions = {
  top?: string,
  miniCardHeight?: number | string
  defaultCardSize?: 'mini' | 'large'
  maskOpacity?: number
  blockedHolderWidth?: number | string
  alwaysPopUp?: boolean
  maskClosable?: boolean
  noHandlebar?: boolean
  backdropColor?: string
  stillBackdrop?: boolean
  swipeClosable?: boolean
  borderRadius?: number | string
  useFade?: boolean
}
type PaperOptions = {
  clipTop?: string
  maskOpacity?: number
  swipeClosable?: boolean
  alwaysPopUp?: boolean
}
type OverlayOptions = {
  maskOpacity?: number
  swipeClosable?: boolean
  alwaysPopUp?: boolean
}
type AppletAttachBehavior = {
  agentSegue: () => Promise<void>
  noSwipeModel: boolean
}
declare interface PresetConfig {
  root: ShadowRoot
  appletsSpace?: HTMLElement
  tunneling?: boolean
  zIndex?: number
  applets?: {
    system?: SystemAppletSettings
    frameworks: FrameworksAppletSettings
  } & {
    [key: string]: AppletAllTypeSettings | undefined
  }
}
declare interface PresetApplets {
  [key: string]: DefineApplet
}
declare interface AppletStatus {
  preload: boolean
  prefetch: boolean
  prerender: boolean
  refreshing: boolean
  requestRefresh: boolean
}
declare interface AppletResources {
  script?: Array<string>
  image?: Array<string>
  worker?: Array<string>
  video?: Array<string>
  audio?: Array<string>
  font?: Array<string>
  style?: Array<string>
  html?: Array<string>
}
declare interface AppletManifest {
  config: AppletAllConfig
  resources?: AppletResources
  components?: ((w: Window) => CustomElementConstructor)[]
  events?: Partial<AppletEvents>
}
declare interface AppletUsualManifest extends AppletManifest {
  config: AppletConfig
}

declare interface AppletAllTypeManifest extends AppletManifest {
  config: AppletAllConfig
}
declare interface FrameworksAppletManifest extends AppletManifest {
  config: FrameworksAppletConfig
}
declare interface SystemAppletManifest {
  config: SystemAppletOnlyConfig
}
declare interface AppletBaseConfig {
  title?: string
  icon?: string
  poster?: string
  level?: number
  refresh?: () => Promise<void>
  timeout?: number
  prerender?: Array<string>
  antecedentApplet?: Array<string>
  free?: boolean
  disableSwipeModel?: boolean
  modality?: ModalityType
  modalityUnderUntouchable?: ModalityType
  sheetOptions?: SheetOptions
  paperOptions?: PaperOptions
  overlayOptions?: OverlayOptions
  animation?: AnimationConfig
  animationUnderUntouchable?: AnimationConfig
  background?: boolean | 'auto'
  color?: string | 'inherit'
  portal?: boolean
  capture?: string | ((resolve: {
    pathname: string
    origin: string
    host: string
    hash: string
    href: string
    search: string
    port: string
    searchParams: URLSearchParams
  }, url: string) => boolean | string)
  mediaGuard?: boolean
  observerGuard?: boolean
  apply?: AppletApplyOptions
  applyOptions?: AppletApplyOptionsParam
  unApply?: AppletApplyOptions
  inject?: (appletWindow: Window, applet: Applet) => void
  injectToDocument?: (appletWindow: Window, applet: Applet) => void
  useMirroring?: boolean
  pullToRefresh?: boolean
  forcedToRefresh?: boolean
  pullToRefreshTargetScrollId?: string
  tapStatusBarToScrollToTop?: boolean
  mainScrollId?: string
  noShadowDom?: boolean
  borderTouchSize?: number
}
declare interface FrameworksAppletConfig extends AppletConfigWithRender {
  index?: string
  singleFlow?: boolean
  singleLock?: boolean
  allowHosts?: Array<string>
  swipeModel?: SwipeModelType
  swipeTransitionType?: SwipeTransitionType
  appSwitcher?: boolean
  oneHistory?: boolean
  preIndex?: string
  limit?: number
  notFound?: string
  safeArea?: ApplicationSafeAreaValue | (() => ApplicationSafeAreaValue)
  transient?: boolean
  transientTimeout?: number
  disableTransient?: boolean
  transfer?: (url: string) => string
  holdBack?: (backoutCount: number) => boolean
  globalCSSVariables?: GlobalCSSVariables | (() => GlobalCSSVariables)
  appletManifestProcess?: (config: AppletManifest) => AppletManifest
}
declare interface SystemAppletOnlyConfig {
  render?: (target: HTMLElement) => void
}
declare interface AppletConfigWithSource extends AppletBaseConfig {
  source?: EitherOr<{
    src?: string
    html?: string | (() => Promise<string> | string)
  }, 'src', 'html'>,
  sandbox?: SandboxOptions
  render?: never
  defaultSlideViewApplets?: never
  openSlideViewLeftHolder?: never
  slideViewSnapType?: never
  slideViewGridRepeat?: never
}
declare interface AppletConfigWithRender extends AppletBaseConfig {
  source?: never
  sandbox?: never
  render?: (target: HTMLElement) => void
  defaultSlideViewApplets?: SlideViewApplets
  openSlideViewLeftHolder?: boolean // Native container edge fallback after shutting down may not be valid
  slideViewSnapType?: SlideViewSnapType
  slideViewGridRepeat?: number
}
type AppletAllConfig = FrameworksAppletConfig | AppletConfig
declare type AppletConfig = AppletConfigWithSource | AppletConfigWithRender
declare interface AppletEvents {
  transformStart: (applet: Applet) => undefined | 'break'
  transformEnd: (applet: Applet) => void
  boot: (applet: Applet) => void
  load: (applet: Applet) => void
  loadError: (applet: Applet) => void
  preload: (applet: Applet) => void
  destroy: (applet: Applet) => void
}
declare interface SegueAnimateState {
  x: number
  y: number
  in: Animate
  out: Animate
  view: Array<HTMLElement>
  width: number
  height: number
  viewports: Array<HTMLElement>
  applets: Array<Applet>
  reverse: boolean
  direction: number
  fallbackState: number
  origin: string | Array<number>
  attach: string | Array<number>
  touches: SegueActionOrigin | undefined
  swipeTransitionType: SwipeTransitionType
  historyDirection: number
  callback: (stillness: boolean) => void
}
declare interface SegueOptions {
  index: string
  defaultIndex: string
  singleFlow?: boolean
  singleLock?: boolean
  notFound?: string
  limit?: number
  oneHistory?: boolean
  defaultAnimation?: AnimationConfig
  swipeModel?: SwipeModelType
  swipeTransitionType?: SwipeTransitionType
  holdBack?: FrameworksAppletConfig['holdBack']
}
declare interface PopState {
  id: string
  title: string
  time: number
  search: string
  historyIndex: number
}
declare interface SegueActionOrigin {
  x: number,
  y: number,
  target: HTMLElement
}

export {
  DefineApplet,
  Slide,
  SlideViewApplets,
  SlideViewSnapType,
  SlidingState,
  SwipeModelType,
  Modality,
  PopState,
  PresetApplets,
  PresetConfig,
  SegueOptions,
  SegueAnimateState,
  SegueActionOrigin,
  SegueBackType,
  Animate,
  Segue,
  AnimationConfig,
  AnimationPrestType,
  AppletStatus,
  AppletResources,
  AppletManifest,
  AppletUsualManifest,
  AppletAllTypeManifest,
  AppletEvents,
  AppletConfig,
  AppletSettings,
  Applet,
  Application,
  AppSwitcher,
  AppletControls,
  AppletAttachBehavior,
  AppletApplyOptions,
  FrameworksAppletConfig,
  FrameworksAppletManifest,
  AppletAllConfig,
  AppletAllTypeSettings,
  ApplicationSafeAreaValue,
  GlobalCSSVariables,
  PushWindowOptions,
  SandboxOptions,
  SheetOptions,
  TriggerEventTypes,
  TriggerEventTypesCallbacks,
  TriggerEventCallback,
  TriggerEventCallbackArgs,
  TriggerEventArgsMap,
  SmoothScroller,
  EitherOr
}
