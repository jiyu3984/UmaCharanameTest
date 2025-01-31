import { ssrRenderComponent, ssrRenderAttrs } from 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/vue/server-renderer/index.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D4G_wtIy.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode } from 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/vue/index.mjs';
import { _ as _export_sfc } from './server.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/ufo/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/h3/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/devalue/index.js';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/@unhead/ssr/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/unhead/dist/index.mjs';
import '../_/nitro.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/destr/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/hookable/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/unenv/runtime/fetch/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/klona/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/defu/dist/defu.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/scule/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/pathe/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/ohash/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/unstorage/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/unstorage/drivers/fs.mjs';
import 'file:///C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/nuxt/dist/core/runtime/nitro/cache-driver.js';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/radix3/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/@unhead/shared/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/unctx/dist/index.mjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/pinia/dist/pinia.prod.cjs';
import 'file://C:/Users/%E7%8E%8B%E5%9B%BD%E6%96%8C/OneDrive/UmaCharanameTest/node_modules/vue-router/dist/vue-router.node.mjs';

const _sfc_main$1 = {
  name: "ModeSelect"
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_nuxt_link = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "mode-select" }, _attrs))} data-v-ad9b294b><div class="buttons" data-v-ad9b294b>`);
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/game?mode=normal",
    class: "mode"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u89D2\u8272\u540D\u6A21\u5F0F`);
      } else {
        return [
          createTextVNode("\u89D2\u8272\u540D\u6A21\u5F0F")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/game?mode=seiyuu",
    class: "mode"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u58F0\u4F18\u5403\u6A21\u5F0F`);
      } else {
        return [
          createTextVNode("\u58F0\u4F18\u5403\u6A21\u5F0F")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ModeSelect.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : undefined;
};
const ModeSelect = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-ad9b294b"]]);
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="container" data-v-7b7af8da><h1 data-v-7b7af8da>\u9A6C\u6279\u6D53\u5EA6\u6D4B\u8BD5\u5668</h1>`);
      _push(ssrRenderComponent(ModeSelect, null, null, _parent));
      _push(`</div><div class="link-container" data-v-7b7af8da><button onclick="window.open(&#39;https://space.bilibili.com/302598998&#39;)" class="link-btn" data-v-7b7af8da><svg width="40" height="40" fill="#0092E4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-v-7b7af8da><g id="SVGRepo_bgCarrier" stroke-width="0" data-v-7b7af8da></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" data-v-7b7af8da></g><g id="SVGRepo_iconCarrier" data-v-7b7af8da><g data-v-7b7af8da><path fill="none" d="M0 0h24v24H0z" data-v-7b7af8da></path><path d="M18.223 3.086a1.25 1.25 0 0 1 0 1.768L17.08 5.996h1.17A3.75 3.75 0 0 1 22 9.747v7.5a3.75 3.75 0 0 1-3.75 3.75H5.75A3.75 3.75 0 0 1 2 17.247v-7.5a3.75 3.75 0 0 1 3.75-3.75h1.166L5.775 4.855a1.25 1.25 0 1 1 1.767-1.768l2.652 2.652c.079.079.145.165.198.257h3.213c.053-.092.12-.18.199-.258l2.651-2.652a1.25 1.25 0 0 1 1.768 0zm.027 5.42H5.75a1.25 1.25 0 0 0-1.247 1.157l-.003.094v7.5c0 .659.51 1.199 1.157 1.246l.093.004h12.5a1.25 1.25 0 0 0 1.247-1.157l.003-.093v-7.5c0-.69-.56-1.25-1.25-1.25zm-10 2.5c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25zm7.5 0c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25z" data-v-7b7af8da></path></g></g></svg></button><button onclick="window.open(&#39;https://github.com/yingyingyingqwq/&#39;)" class="link-btn" data-v-7b7af8da><svg width="40" height="40" fill="#5E5E5E" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="github" data-v-7b7af8da><path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z" data-v-7b7af8da></path></svg></button></div><!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7b7af8da"]]);

export { index as default };
//# sourceMappingURL=index-D4KoeDHh.mjs.map
