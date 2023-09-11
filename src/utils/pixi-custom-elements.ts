// main.js
import { Text } from 'pixi.js';
import { Viewport, type IViewportOptions } from 'pixi-viewport';

import { patchProp, renderer } from 'vue3-pixi';

renderer.use({
  name: 'Viewport',
  createElement: props => new Viewport(props as IViewportOptions),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});
