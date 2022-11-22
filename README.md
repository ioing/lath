# Introduce

A pure front-end container
Bring interactive experiences comparable to Native Apps.

https://lath.dev

# Install：

```bash
$ npm i lath --save
```

# Example
https://github.com/ioing/lath-vue-example

# Use

```html
<html>
  <body>
    <define-application default-applet="home">
      <define-applet applet-id="frameworks">
        <p>
          I am FrameworksApplets
        </p>
      </define-applet>
      <define-applet applet-id="home">
        <p>
          I am home
        </p>
      </define-applet>
      <define-applet applet-id="pageA">
        <p>
          I am pageA
        </p>
      </define-applet>
  </body>
</html>
```

```ts
import { createApplication } from 'lath'
 /**
 * "home": moduleName
 * "root": target element id
 */
createApplication({
  applets: {
    frameworks: {...}, // frameworks module config
    home: {...} // normal module config
    pageA: {...} // normal module config
    pageC: {
      config: {
        source: {
          src: '/c.html'
        }
      },
      ...
    } // normal module config
  }
}).then(( application ) => {
  console.log(application)
})
```
