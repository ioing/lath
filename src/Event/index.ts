import { TriggerEventTypes, TriggerEventCallbackArgs, TriggerEventCallback } from '../types'

type EventMap = {
  [key in TriggerEventTypes]?: TriggerEventCallback<key>[]
}

const EventGroupSymbol = Symbol('__EventGroupName__')
class EventProvider {
  private _events: EventMap = {}
  public on<T extends TriggerEventTypes, F extends TriggerEventCallback<T>>(type: T, fn: F, groupName?: string): this {
    Object.defineProperty(fn, EventGroupSymbol, { value: groupName, writable: true })
    if (!this._events[type]) this._events[type] = []
    this._events[type]?.push(fn)
    return this
  }

  public one<T extends TriggerEventTypes, F extends TriggerEventCallback<T>>(type: T, fn: F, groupName?: string): this {
    const once: TriggerEventCallback<T> = ((...args: TriggerEventCallbackArgs<T>) => {
      fn(...args)
      this.off(type, once)
    })
    Object.defineProperty(once, EventGroupSymbol, { value: groupName, writable: true })

    if (!this._events[type]) this._events[type] = []
    this._events[type]?.push(once)

    return this
  }

  public off<T extends TriggerEventTypes, F extends TriggerEventCallback<T>>(type: T, fn: F): this {
    if (!this._events[type]) return this
    const index = this._events[type]?.indexOf(fn) ?? -1
    if (index > -1) this._events[type]?.splice(index, 1)
    return this
  }

  public removeEventGroup(groupName: string): this {
    const filter = <T extends TriggerEventTypes>(t: T) => {
      interface GroupTriggerEventCallback extends TriggerEventCallback<T> {
        [EventGroupSymbol]: string
      }
      return this._events[t]?.filter((fn) => {
        return (fn as GroupTriggerEventCallback)[EventGroupSymbol] !== groupName
      })
    }

    for (const type in this._events) {
      this._events[type as TriggerEventTypes] = filter(type as TriggerEventTypes)
    }
    return this
  }

  public trigger<T extends TriggerEventTypes>(type: T, ...args: TriggerEventCallbackArgs<T>): this {
    if (!this._events[type]) return this

    this._events[type]?.forEach((fn) => {
      try {
        fn(...args)
      } catch (e) {
        this.off(type, fn)
        this.trigger('error', e)
      }
    })
    return this
  }
}

export {
  EventProvider
}
