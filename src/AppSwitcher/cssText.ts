export const switcherCSSText = `
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 102;
  width: 100%;
  height: 100%;
  background: rgb(70 70 70 / 50%);
  opacity: 0;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  transition: opacity .4s ease;
`
export const snapWrapperCSSText = `
  display: grid;
  box-sizing: border-box;
  position: fixed;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 20px 10px;
  padding-top: calc(20px + constant(safe-area-inset-top));
  padding-top: calc(20px + env(safe-area-inset-top));
  scroll-padding-top: calc(20px + constant(safe-area-inset-top));
  scroll-padding-top: calc(20px + env(safe-area-inset-top));
  overflow-y: hidden;
  scroll-behavior: smooth;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
`

export const snapWrapper2CSSText = `
  ${snapWrapperCSSText}
  grid-template-columns: 50% 50%;
  grid-template-rows: repeat(30, 40%);
  row-gap: 15px;
`

export const snapWrapper3CSSText = `
  ${snapWrapperCSSText}
  grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(30, 50%);
  row-gap: 15px;
`

export const itemImgWrapperCSSText = `
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgb(0 0 0 / 30%);
`

export const itemViewCSSText = `
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  scroll-snap-align: start;
  cursor: pointer;
  margin: 0 10px;
  transition: transform .4s ease;
`

export const itemImgCSSText = `
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  transform-origin: top left;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  overflow: hidden;
`

export const itemImgCoverCSSText = `
  position: fixed;
  top: 0;
  left: 0;
  ${itemImgCSSText}
`

export const itemInfoCSSText = `
  display: flex;
  margin: 0 auto;
  width: 100%;
  justify-content: center;
  align-items: center;
`

export const itemTitleCSSText = `
  margin-top: 4px;
  font-size: 16px;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: "SF Pro Text","Myriad Set Pro","SF Pro Icons","Apple Legacy Chevron","Helvetica","Arial",sans-serif;
`

export const itemCloseBtnCSSText = `
  display: grid;
  place-items: center;
  position: absolute;
  right: 4px;
  top: 4px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background-color: #666;
  opacity: .7
`

const itemCloseBtnXShapeCSSText = `
  position: absolute;
  height: 2px;
  width: 60%;
  background: #fff;
  border-radius: 1px;
`

export const itemCloseBtnX1ShapeCSSText = `
  ${itemCloseBtnXShapeCSSText}
  transform: rotate(-45deg);
`
export const itemCloseBtnX2ShapeCSSText = `
  ${itemCloseBtnXShapeCSSText}
  transform: rotate(45deg);
`