import { effectScope, shallowReactive, reactive, getCurrentScope, hasInjectionContext, getCurrentInstance, inject, toRef, version, unref, shallowRef, isReadonly, isRef, isShallow, isReactive, toRaw, defineComponent, h, computed, ref, provide, Suspense, nextTick, mergeProps, watch, Fragment, withCtx, createVNode, useSSRContext, defineAsyncComponent, onErrorCaptured, onServerPrefetch, resolveDynamicComponent, createApp } from "vue";
import { $fetch } from "ofetch";
import { baseURL } from "#internal/nuxt/paths";
import { createHooks } from "hookable";
import { getContext } from "unctx";
import { sanitizeStatusCode, createError as createError$1, appendHeader } from "h3";
import { shouldHydrate, createPinia, setActivePinia } from "pinia";
import { defu } from "defu";
import { getActiveHead, CapoPlugin } from "unhead";
import { defineHeadPlugin } from "@unhead/shared";
import { START_LOCATION, createMemoryHistory, createRouter as createRouter$1, useRoute as useRoute$1, RouterView } from "vue-router";
import { toRouteMatcher, createRouter } from "radix3";
import { hasProtocol, isScriptProtocol, joinURL, withQuery } from "ufo";
import "destr";
import "klona";
import { ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode } from "vue/server-renderer";
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
const appLayoutTransition = false;
const appPageTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink", "prefetch": true, "prefetchOn": { "visibility": true } };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  var _a;
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.15.3";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...((_a = options.ssrContext) == null ? void 0 : _a.payload) || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a, _b, _c, _d;
  const resolvedPlugins = [];
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    var _a2;
    const unresolvedPluginsForThisPlugin = ((_a2 = plugin2.dependsOn) == null ? void 0 : _a2.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.includes(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.push(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin2.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin2.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) && ((_d = plugin2.env) == null ? void 0 : _d.islands) === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance = nuxtAppInstance || getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = (options == null ? void 0 : options.external) || isExternalHost;
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value = error2.value || nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
version[0] === "3";
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref2) {
  if (ref2 instanceof Promise || ref2 instanceof Date || ref2 instanceof RegExp)
    return ref2;
  const root = resolveUnref(ref2);
  if (!ref2 || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r));
  if (typeof root === "object") {
    const resolved = {};
    for (const k in root) {
      if (!Object.prototype.hasOwnProperty.call(root, k)) {
        continue;
      }
      if (k === "titleTemplate" || k[0] === "o" && k[1] === "n") {
        resolved[k] = unref(root[k]);
        continue;
      }
      resolved[k] = resolveUnrefHeadInput(root[k]);
    }
    return resolved;
  }
  return root;
}
defineHeadPlugin({
  hooks: {
    "entries:resolve": (ctx) => {
      for (const entry2 of ctx.entries)
        entry2.resolvedInput = resolveUnrefHeadInput(entry2.input);
    }
  }
});
const headSymbol = "usehead";
const _global = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey$1 = "__unhead_injection_handler__";
function setHeadInjectionHandler(handler) {
  _global[globalKey$1] = handler;
}
function injectHead() {
  if (globalKey$1 in _global) {
    return _global[globalKey$1]();
  }
  const head = inject(headSymbol);
  if (!head && process.env.NODE_ENV !== "production")
    console.warn("Unhead is missing Vue context, falling back to shared context. This may have unexpected results.");
  return head || getActiveHead();
}
async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !shouldHydrate(data) && 1
  );
});
[CapoPlugin({ track: true })];
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    setHeadInjectionHandler(
      // need a fresh instance of the nuxt app to avoid parallel requests interfering with each other
      () => useNuxtApp().vueApp._context.provides.usehead
    );
    nuxtApp.vueApp.use(head);
  }
});
function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
_globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}
const ROUTE_KEY_PARENTHESES_RE$1 = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE$1 = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE$1 = /:\w+/g;
const interpolatePath = (route, match) => {
  return match.path.replace(ROUTE_KEY_PARENTHESES_RE$1, "$1").replace(ROUTE_KEY_SYMBOLS_RE$1, "$1").replace(ROUTE_KEY_NORMAL_RE$1, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey$1 = (routeProps, override) => {
  const matchedRoute = routeProps.route.matched.find((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === routeProps.Component.type;
  });
  const source = override ?? (matchedRoute == null ? void 0 : matchedRoute.meta.key) ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
  return typeof source === "function" ? source(routeProps.route) : source;
};
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
function handleHotUpdate(_router, _generateRoutes) {
}
const _routes = [
  {
    name: "game",
    path: "/game",
    component: () => import("./_nuxt/game-Bj_3_hLL.js")
  },
  {
    name: "index",
    path: "/",
    component: () => import("./_nuxt/index-D4KoeDHh.js")
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => {
    var _a;
    return (_a = children.default) == null ? void 0 : _a.call(children);
  } };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = (route == null ? void 0 : route.meta.key) ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => {
      var _a, _b;
      return comp.components && comp.components.default === ((_b = (_a = from.matched[index]) == null ? void 0 : _a.components) == null ? void 0 : _b.default);
    }
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    var _a;
    const nuxtApp = useNuxtApp();
    const behavior = ((_a = useRouter().options) == null ? void 0 : _a.scrollBehaviorType) ?? "auto";
    let position = savedPosition || void 0;
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (!position && from && to && routeAllowsScrollToTop !== false && isChangingPage(to, from)) {
      position = { left: 0, top: 0 };
    }
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
      }
      return false;
    }
    const hasTransition = (route) => !!(route.meta.pageTransition ?? appPageTransition);
    const hookToWait = hasTransition(from) && hasTransition(to) ? "page:transition:finish" : "page:finish";
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await new Promise((resolve2) => setTimeout(resolve2, 0));
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
        }
        resolve(position);
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const hashMode = false;
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  var _a;
  let __temp, __restore;
  if (!((_a = to.meta) == null ? void 0 : _a.validate)) {
    return;
  }
  const nuxtApp = useNuxtApp();
  const router = useRouter();
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    statusCode: result && result.statusCode || 404,
    statusMessage: result && result.statusMessage || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  const unsub = router.beforeResolve((final) => {
    unsub();
    if (final === to) {
      const unsub2 = router.afterEach(async () => {
        unsub2();
        await nuxtApp.runWithContext(() => showError(error));
      });
      return false;
    }
  });
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a, _b, _c;
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = ((_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes2 = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter$1({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes: routes2
    });
    handleHotUpdate(router, routerOptions.routes ? routerOptions.routes : (routes22) => routes22);
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      var _a2, _b2, _c2, _d;
      if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d = (_c2 = from.matched[0]) == null ? void 0 : _c2.components) == null ? void 0 : _d.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    useError();
    if (!((_b = nuxtApp.ssrContext) == null ? void 0 : _b.islandContext)) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if ((failure == null ? void 0 : failure.type) === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if ((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      var _a2, _b2;
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext)) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray$1(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        {
          const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to.path }));
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(key);
              } else {
                middlewareEntries.delete(key);
              }
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          const result = await nuxtApp.runWithContext(() => middleware(to, from));
          {
            if (result === false || result instanceof Error) {
              const error2 = result || createError$1({
                statusCode: 404,
                statusMessage: `Page Not Found: ${initialURL}`
              });
              await nuxtApp.runWithContext(() => showError(error2));
              return false;
            }
          }
          if (result === true) {
            continue;
          }
          if (result || result === false) {
            return result;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach(async (to, _from) => {
      if (to.matched.length === 0) {
        await nuxtApp.runWithContext(() => showError(createError$1({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_eJ33V7gbc6 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function prerenderRoutes(path) {
  if (!import.meta.prerender) {
    return;
  }
  const paths = toArray(path);
  appendHeader(useRequestEvent(), "x-nitro-prerender", paths.map((p) => encodeURIComponent(p)).join(", "));
}
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    setActivePinia(pinia);
    {
      nuxtApp.payload.pinia = toRaw(pinia.state.value);
    }
    return {
      provide: {
        pinia
      }
    };
  }
});
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const characterSchema = {
  type: "object",
  required: ["id", "image", "names", "seiyuu"],
  properties: {
    id: { type: "number" },
    image: { type: "string" },
    names: {
      type: "object",
      required: ["jp", "zh"],
      properties: {
        jp: { type: "string" },
        zh: { type: "string" },
        aliases: { type: "array" },
        en: { type: "string" }
      }
    },
    seiyuu: {
      type: "object",
      required: ["jp", "zh"],
      properties: {
        jp: { type: "string" },
        zh: { type: "string" },
        aliases: { type: "array" },
        en: { type: "string" }
      }
    },
    mainColor: { type: "string" },
    subColor: { type: "string" }
  }
};
const charactersData = /* @__PURE__ */ JSON.parse('[{"id":1,"image":"specialweek.webp","names":{"jp":"スペシャルウィーク","zh":"特别周","aliases":["特别周"],"en":"Special Week"},"seiyuu":{"jp":"和氣あず未","zh":"和气杏未","aliases":["和气杏未"],"en":"Waki Azumi"},"mainColor":"#EE6DCB","subColor":"#FFDEF9"},{"id":2,"image":"silencesuzuka.webp","names":{"jp":"サイレンススズカ","zh":"无声铃鹿","aliases":["无声铃鹿"],"en":"Silence Suzuka"},"seiyuu":{"jp":"高野麻里佳","zh":"高野麻里佳","aliases":["高野麻里佳"],"en":"Takano Marika"},"mainColor":"#29BD70","subColor":"#FFCE48"},{"id":3,"image":"tokaiteio.webp","names":{"jp":"トウカイテイオー","zh":"东海帝王","aliases":["东海帝皇"],"en":"Tokai Teio"},"seiyuu":{"jp":"Machico","zh":"Machico","aliases":["Machico"],"en":"Machico"},"mainColor":"#3376D2","subColor":"#FF99D0"},{"id":4,"image":"maruzensky.webp","names":{"jp":"マルゼンスキー","zh":"丸善斯基","aliases":["丸善斯基"],"en":"Maruzensky"},"seiyuu":{"jp":"Lynn","zh":"Lynn","aliases":["Lynn"],"en":"Lynn"},"mainColor":"#EA504A","subColor":"#FFCD00"},{"id":5,"image":"fujikiseki.webp","names":{"jp":"フジキセキ","zh":"富士奇迹","aliases":["富士奇石"],"en":"Fuji Kiseki"},"seiyuu":{"jp":"松井恵理子","zh":"松井惠理子","aliases":["松井惠理子"],"en":"Matsui Eriko"},"mainColor":"#444745","subColor":"#33B839"},{"id":6,"image":"oguricap.webp","names":{"jp":"オグリキャップ","zh":"小栗帽","aliases":["小栗帽"],"en":"Oguri Cap"},"seiyuu":{"jp":"高柳知葉","zh":"高柳知叶","aliases":["高柳知叶"],"en":"Takayanagi Tomoha"},"mainColor":"#3A7AD2","subColor":"#ECE7E7"},{"id":7,"image":"goldship.webp","names":{"jp":"ゴールドシップ","zh":"黄金船","aliases":["黄金船"],"en":"Gold Ship"},"seiyuu":{"jp":"上田瞳","zh":"上田瞳","aliases":["上田瞳"],"en":"Ueda Hitomi"},"mainColor":"#DA3C57","subColor":"#E9DA36"},{"id":8,"image":"vodka.webp","names":{"jp":"ウオッカ","zh":"伏特加","aliases":["伏特加"],"en":"Vodka"},"seiyuu":{"jp":"大橋彩香","zh":"大桥彩香","aliases":["大桥彩香"],"en":"Ohashi Ayaka"},"mainColor":"#D4C200","subColor":"#3DD1D7"},{"id":9,"image":"daiwascarlet.webp","names":{"jp":"ダイワスカーレット","zh":"大和赤骥","aliases":["大和赤骥"],"en":"Daiwa Scarlet"},"seiyuu":{"jp":"木村千咲","zh":"木村千咲","aliases":["木村千咲"],"en":"Kimura Chisaki"},"mainColor":"#4F64D8","subColor":"#E73472"},{"id":10,"image":"taikishuttle.webp","names":{"jp":"タイキシャトル","zh":"大树快车","aliases":["大树快车"],"en":"Taiki Shuttle"},"seiyuu":{"jp":"大坪由佳","zh":"大坪由佳","aliases":["大坪由佳"],"en":"Ootsubo Yuka"},"mainColor":"#73C032","subColor":"#FFAC42"},{"id":11,"image":"grasswonder.webp","names":{"jp":"グラスワンダー","zh":"草上飞","aliases":["草上飞"],"en":"Grass Wonder"},"seiyuu":{"jp":"前田玲奈","zh":"前田玲奈","aliases":["前田玲奈"],"en":"Maeda Rena"},"mainColor":"#3A34AC","subColor":"#E3493F"},{"id":12,"image":"hishiamazon.webp","names":{"jp":"ヒシアマゾン","zh":"菱亚马逊","aliases":["菱亚马逊"],"en":"Hishi Amazon"},"seiyuu":{"jp":"巽悠衣子","zh":"巽悠衣子","aliases":["巽悠衣子"],"en":"Tatsumi Yuiko"},"mainColor":"#2185D0","subColor":"#E6453A"},{"id":13,"image":"mejiromcqueen.webp","names":{"jp":"メジロマックイーン","zh":"目白麦昆","aliases":["目白麦昆"],"en":"Mejiro McQueen"},"seiyuu":{"jp":"大西沙織","zh":"大西沙织","aliases":["大西沙织"],"en":"Oonishi Saori"},"mainColor":"#00B5BE","subColor":"#DFC8E7"},{"id":14,"image":"elcondorpasa.webp","names":{"jp":"エルコンドルパサー","zh":"神鹰","aliases":["神鹰"],"en":"El Condor Pasa"},"seiyuu":{"jp":"髙橋ミナミ","zh":"高桥未奈美","aliases":["高桥美奈美"],"en":"Takahashi Minami"},"mainColor":"#DD4E31","subColor":"#EFDB28"},{"id":15,"image":"tmoperao.webp","names":{"jp":"テイエムオペラオー","zh":"好歌剧","aliases":["T.M.歌剧王"],"en":"T.M. Opera O"},"seiyuu":{"jp":"徳井青空","zh":"德井青空","aliases":["德井青空"],"en":"Tokui Sora"},"mainColor":"#F271C4","subColor":"#FBE415"},{"id":16,"image":"naritabrian.webp","names":{"jp":"ナリタブライアン","zh":"成田白仁","aliases":["成田白仁"],"en":"Narita Brian"},"seiyuu":{"jp":"衣川里佳","zh":"衣川里佳","aliases":["衣川里佳"],"en":"Kinugawa Rika"},"mainColor":"#75358C","subColor":"#D638A3"},{"id":17,"image":"symbolirudolf.webp","names":{"jp":"シンボリルドルフ","zh":"鲁道夫象征","aliases":["鲁铎象征"],"en":"Symboli Rudolf"},"seiyuu":{"jp":"田所あずさ","zh":"田所梓","aliases":["田所梓"],"en":"Tadokoro Azusa"},"mainColor":"#1C7763","subColor":"#C6314B"},{"id":18,"image":"airgroove.webp","names":{"jp":"エアグルーヴ","zh":"气槽","aliases":["空中律动"],"en":"Air Groove"},"seiyuu":{"jp":"青木瑠璃子","zh":"青木瑠璃子","aliases":["青木瑠璃子"],"en":"Aoki Ruriko"},"mainColor":"#0092CB","subColor":"#FAE053"},{"id":19,"image":"agnesdigital.webp","names":{"jp":"アグネスデジタル","zh":"爱丽数码","aliases":["爱丽数码"],"en":"Agnes Digital"},"seiyuu":{"jp":"鈴木みのり","zh":"铃木实里","aliases":["铃木实里"],"en":"Suzuki Minori"},"mainColor":"#F37F96","subColor":"#F9F189"},{"id":20,"image":"seiunsky.webp","names":{"jp":"セイウンスカイ","zh":"青云天空","aliases":["星云天空"],"en":"Seiun Sky"},"seiyuu":{"jp":"鬼頭明里","zh":"鬼头明里","aliases":["鬼头明里"],"en":"Kitou Akari"},"mainColor":"#65D283","subColor":"#F4DA40"},{"id":21,"image":"tamamocross.webp","names":{"jp":"タマモクロス","zh":"玉藻十字","aliases":["玉藻十字"],"en":"Tamamo Cross"},"seiyuu":{"jp":"大空直美","zh":"大空直美","aliases":["大空直美"],"en":"Ozora Naomi"},"mainColor":"#3290D6","subColor":"#C6DAE7"},{"id":22,"image":"finemotion.webp","names":{"jp":"ファインモーション","zh":"美妙姿势","aliases":["美妙姿势"],"en":"Fine Motion"},"seiyuu":{"jp":"橋本ちなみ","zh":"桥本千奈美","aliases":["桥本千奈美"],"en":"Hashimoto Chinami"},"mainColor":"#20A95C","subColor":"#EE5340"},{"id":23,"image":"biwahayahide.webp","names":{"jp":"ビワハヤヒデ","zh":"琵琶晨光","aliases":["琵琶晨光"],"en":"Biwa Hayahide"},"seiyuu":{"jp":"近藤唯","zh":"近藤唯","aliases":["近藤唯"],"en":"Kondo Yui"},"mainColor":"#B03D81","subColor":"#E776B6"},{"id":24,"image":"mayanotopgun.webp","names":{"jp":"マヤノトップガン","zh":"摩耶重炮","aliases":["重炮"],"en":"Mayano Top Gun"},"seiyuu":{"jp":"星谷美緒","zh":"星谷美绪","aliases":["星谷美绪"],"en":"Hoshitani Mio"},"mainColor":"#F57D38","subColor":"#FFC845"},{"id":25,"image":"manhattancafe.webp","names":{"jp":"マンハッタンカフェ","zh":"曼城茶座","aliases":["曼哈顿咖啡"],"en":"Manhattan Cafe"},"seiyuu":{"jp":"小倉唯","zh":"小仓唯","aliases":["小仓唯"],"en":"Ogura Yui"},"mainColor":"#494541","subColor":"#E8DD4C"},{"id":26,"image":"mihonobourbon.webp","names":{"jp":"ミホノブルボン","zh":"美浦波旁","aliases":["美浦波旁"],"en":"Mihono Bourbon"},"seiyuu":{"jp":"長谷川育美","zh":"长谷川育美","aliases":["长谷川育美"],"en":"Hasegawa Ikumi"},"mainColor":"#EE60A1","subColor":"#F0ED41"},{"id":27,"image":"mejiroryan.webp","names":{"jp":"メジロライアン","zh":"目白赖恩","aliases":["目白莱恩"],"en":"Mejiro Ryan"},"seiyuu":{"jp":"土師亜文","zh":"土师亚文","aliases":["土师亚文"],"en":"Haji Ayafumi"},"mainColor":"#14BAAE","subColor":"#7C4D3A"},{"id":28,"image":"hishiakebono.webp","names":{"jp":"ヒシアケボノ","zh":"菱曙","aliases":["菱曙"],"en":"Hishi Akebono"},"seiyuu":{"jp":"松嵜麗","zh":"松嵜丽","aliases":["松嵜丽"],"en":"Matsuzaki Rei"},"mainColor":"#208BCD","subColor":"#FA6F8B"},{"id":29,"image":"yukinobijin.webp","names":{"jp":"ユキノビジン","zh":"雪之美人","aliases":["雪美人"],"en":"Yukino Bijin"},"seiyuu":{"jp":"山本希望","zh":"山本希望","aliases":["山本希望"],"en":"Yamamoto Nozomi"},"mainColor":"#AF7E51","subColor":"#C8D8EB"},{"id":30,"image":"riceshower.webp","names":{"jp":"ライスシャワー","zh":"米浴","aliases":["米浴"],"en":"Rice Shower"},"seiyuu":{"jp":"石見舞菜香","zh":"石见舞菜香","aliases":["石见舞菜香"],"en":"Iwami Manaka"},"mainColor":"#384A86","subColor":"#CA3E6D"},{"id":31,"image":"inesfujin.webp","names":{"jp":"アイネスフウジン","zh":"艾尼斯风神","aliases":["艾尼风神"],"en":"Ines Fujin"},"seiyuu":{"jp":"長江里加","zh":"长江里加","aliases":["长江里加"],"en":"Nagae Rika"},"mainColor":"#F078C5","subColor":"#54AE1B"},{"id":32,"image":"agnestachyon.webp","names":{"jp":"アグネスタキオン","zh":"爱丽速子","aliases":["爱丽快子"],"en":"Agnes Tachyon"},"seiyuu":{"jp":"上坂すみれ","zh":"上坂堇","aliases":["上坂堇"],"en":"Uesaka Sumire"},"mainColor":"#35B2B6","subColor":"#E2E868"},{"id":33,"image":"admirevega.webp","names":{"jp":"アドマイヤベガ","zh":"爱慕织姬","aliases":["爱慕织姬"],"en":"Admire Vega"},"seiyuu":{"jp":"咲々木瞳","zh":"咲咲木瞳","aliases":["咲咲木瞳"],"en":"Sakusaki Hitomi"},"mainColor":"#3865A1","subColor":"#78D5E1"},{"id":34,"image":"inarione.webp","names":{"jp":"イナリワン","zh":"稻荷一","aliases":["稻荷一"],"en":"Inari One"},"seiyuu":{"jp":"井上遥乃","zh":"井上遥乃","aliases":["井上遥乃"],"en":"Inoue Haruno"},"mainColor":"#AE419E","subColor":"#EC86D0"},{"id":35,"image":"winningticket.webp","names":{"jp":"ウイニングチケット","zh":"胜利奖券","aliases":["胜利奖券"],"en":"Winning Ticket"},"seiyuu":{"jp":"渡部優衣","zh":"渡部优衣","aliases":["渡部优衣"],"en":"Watanabe Yui"},"mainColor":"#DD3D5B","subColor":"#EDE233"},{"id":36,"image":"airshakur.webp","names":{"jp":"エアシャカール","zh":"空中神宫","aliases":["空中神宫"],"en":"Air Shakur"},"seiyuu":{"jp":"津田美波","zh":"津田美波","aliases":["津田美波"],"en":"Tsuda Minami"},"mainColor":"#2459B4","subColor":"#E1E000"},{"id":37,"image":"eishinflash.webp","names":{"jp":"エイシンフラッシュ","zh":"荣进闪耀","aliases":["荣进闪耀"],"en":"Eishin Flash"},"seiyuu":{"jp":"藤野彩水","zh":"藤野彩水","aliases":["藤野彩水"],"en":"Fujino Ayami"},"mainColor":"#3D3B3A","subColor":"#E33067"},{"id":38,"image":"currenchan.webp","names":{"jp":"カレンチャン","zh":"真机伶","aliases":["真机伶"],"en":"Curren Chan"},"seiyuu":{"jp":"篠原侑","zh":"篠原侑","aliases":["篠原侑"],"en":"Shinohara Yu"},"mainColor":"#F86669","subColor":"#47423E"},{"id":39,"image":"kawakamiprincess.webp","names":{"jp":"カワカミプリンセス","zh":"川上公主","aliases":["川上公主"],"en":"Kawakami Princess"},"seiyuu":{"jp":"高橋花林","zh":"高桥花林","aliases":["高桥花林"],"en":"Takahashi Karin"},"mainColor":"#E146A7","subColor":"#00C7B1"},{"id":40,"image":"goldcity.webp","names":{"jp":"ゴールドシチー","zh":"黄金城","aliases":["黄金城市"],"en":"Gold City"},"seiyuu":{"jp":"香坂さき","zh":"香坂早纪","aliases":["香坂早纪"],"en":"Kousaka Saki"},"mainColor":"#245099","subColor":"#E63C5C"},{"id":41,"image":"sakurabakushino.webp","names":{"jp":"サクラバクシンオー","zh":"樱花进王","aliases":["樱花爆进王"],"en":"Sakura Bakushin O"},"seiyuu":{"jp":"三澤紗千香","zh":"三泽纱千香","aliases":["三泽纱千香"],"en":"Misawa Sachika"},"mainColor":"#EE6FAB","subColor":"#F2D4D7"},{"id":42,"image":"seekingthepearl.webp","names":{"jp":"シーキングザパール","zh":"采珠","aliases":["采珠"],"en":"Seeking the Pearl"},"seiyuu":{"jp":"福原綾香","zh":"福原绫香","aliases":["福原绫香"],"en":"Fukuhara Ayaka"},"mainColor":"#B02D40","subColor":"#1690D4"},{"id":43,"image":"shinkowindy.webp","names":{"jp":"シンコウウインディ","zh":"新宇宙","aliases":["新宇宙"],"en":"Shinko Windy"},"seiyuu":{"jp":"高田憂希","zh":"高田忧希","aliases":["高田忧希"],"en":"Takada Yuuki"},"mainColor":"#63666A","subColor":"#6F2678"},{"id":44,"image":"sweeptosho.webp","names":{"jp":"スイープトウショウ","zh":"东商变革","aliases":["东商变革"],"en":"Sweep Tosho"},"seiyuu":{"jp":"杉浦しおり","zh":"杉浦诗织","aliases":["杉浦诗织"],"en":"Sugiura Shiori"},"mainColor":"#926DDA","subColor":"#BC204B"},{"id":45,"image":"supercreek.webp","names":{"jp":"スーパークリーク","zh":"超级溪流","aliases":["超级小海湾","超级小溪"],"en":"Super Creek"},"seiyuu":{"jp":"優木かな","zh":"优木加奈","aliases":["优木加奈"],"en":"Yuuki Kana"},"mainColor":"#5693DA","subColor":"#C8C9C7"},{"id":46,"image":"smartfalcon.webp","names":{"jp":"スマートファルコン","zh":"醒目飞鹰","aliases":["醒目飞鹰"],"en":"Smart Falcon"},"seiyuu":{"jp":"大和田仁美","zh":"大和田仁美","aliases":["大和田仁美"],"en":"Oowada Hitomi"},"mainColor":"#F8587B","subColor":"#403A35"},{"id":47,"image":"zennorobroy.webp","names":{"jp":"ゼンノロブロイ","zh":"荒漠英雄","aliases":["荒漠英雄"],"en":"Zenno Rob Roy"},"seiyuu":{"jp":"照井春佳","zh":"照井春佳","aliases":["照井春佳"],"en":"Terui Haruka"},"mainColor":"#5F9B26","subColor":"#F3EA5D"},{"id":48,"image":"tosenjordan.webp","names":{"jp":"トーセンジョーダン","zh":"东瀛佐敦","aliases":["岛川乔登","岛川乔丹"],"en":"Tosen Jordan"},"seiyuu":{"jp":"鈴木絵理","zh":"铃木绘理","aliases":["铃木绘理"],"en":"Suzuki Eri"},"mainColor":"#25B8AE","subColor":"#1C57B9"},{"id":49,"image":"nakayamafesta.webp","names":{"jp":"ナカヤマフェスタ","zh":"中山庆典","aliases":["中山庆典"],"en":"Nakayama Festa"},"seiyuu":{"jp":"下地紫野","zh":"下地紫野","aliases":["下地紫野"],"en":"Shimoji Shino"},"mainColor":"#C0453F","subColor":"#236192"},{"id":50,"image":"naritataishin.webp","names":{"jp":"ナリタタイシン","zh":"成田大进","aliases":["成田大进"],"en":"Narita Taishin"},"seiyuu":{"jp":"渡部恵子","zh":"渡部惠子","aliases":["渡部惠子"],"en":"Watanabe Keiko"},"mainColor":"#E575CE","subColor":"#F3DD6D"},{"id":51,"image":"nishinoflower.webp","names":{"jp":"ニシノフラワー","zh":"西野花","aliases":["西野花"],"en":"Nishino Flower"},"seiyuu":{"jp":"河井晴菜","zh":"河井晴菜","aliases":["河井晴菜"],"en":"Kawai Haruna"},"mainColor":"#E26ECB","subColor":"#F6EB61"},{"id":52,"image":"haruurara.webp","names":{"jp":"ハルウララ","zh":"春乌菈菈","aliases":["春丽"],"en":"Haru Urara"},"seiyuu":{"jp":"首藤志奈","zh":"首藤志奈","aliases":["首藤志奈"],"en":"Shuto Shina"},"mainColor":"#FA7395","subColor":"#EDE04B"},{"id":53,"image":"bamboomemory.webp","names":{"jp":"バンブーメモリー","zh":"青竹回忆","aliases":["青竹回忆"],"en":"Bamboo Memory"},"seiyuu":{"jp":"藍原ことみ","zh":"蓝原琴美","aliases":["蓝原琴美"],"en":"Aihara Kotomi"},"mainColor":"#366965","subColor":"#2D2926"},{"id":54,"image":"bikopegasus.webp","names":{"jp":"ビコーペガサス","zh":"微光飞驹","aliases":["微光飞驹"],"en":"Biko Pegasus"},"seiyuu":{"jp":"田中あいみ","zh":"田中爱美","aliases":["田中爱美"],"en":"Tanaka Aimi"},"mainColor":"#E7396F","subColor":"#D162B8"},{"id":55,"image":"marveloussunday.webp","names":{"jp":"マーベラスサンデー","zh":"美丽周日","aliases":["美妙周日"],"en":"Marvelous Sunday"},"seiyuu":{"jp":"三宅麻理恵","zh":"三宅麻理惠","aliases":["三宅麻理惠"],"en":"Miyake Marie"},"mainColor":"#CA46B0","subColor":"#B52542"},{"id":56,"image":"matikanefukukitaru.webp","names":{"jp":"マチカネフクキタル","zh":"待兼福来","aliases":["待兼福来"],"en":"Matikanefukukitaru"},"seiyuu":{"jp":"新田ひより","zh":"新田日葵","aliases":["新田日葵"],"en":"Nitta Hiyori"},"mainColor":"#3D89E9","subColor":"#F8A717"},{"id":57,"image":"mrcb.webp","names":{"jp":"ミスターシービー","zh":"千明代表","aliases":["千明代表"],"en":"Mr. C.B."},"seiyuu":{"jp":"天海由梨奈","zh":"天海由梨奈","aliases":["天海由梨奈"],"en":"Amami Yurina"},"mainColor":"#6FC346","subColor":"#FBE122"},{"id":58,"image":"meishodoto.webp","names":{"jp":"メイショウドトウ","zh":"名将怒涛","aliases":["名将怒涛"],"en":"Meisho Doto"},"seiyuu":{"jp":"和多田美咲","zh":"和多田美咲","aliases":["和多田美咲"],"en":"Wadada Misaki"},"mainColor":"#46449B","subColor":"#D64388"},{"id":59,"image":"mejirodober.webp","names":{"jp":"メジロドーベル","zh":"目白多伯","aliases":["目白多伯"],"en":"Mejiro Dober"},"seiyuu":{"jp":"久保田ひかり","zh":"久保田光","aliases":["久保田光"],"en":"Kubota Hikari"},"mainColor":"#19B49E","subColor":"#6F3B42"},{"id":60,"image":"nicenature.webp","names":{"jp":"ナイスネイチャ","zh":"优秀素质","aliases":["好天资"],"en":"Nice Nature"},"seiyuu":{"jp":"前田佳織里","zh":"前田佳织里","aliases":["前田佳织里"],"en":"Maeda Kaori"},"mainColor":"#28A959","subColor":"#B82720"},{"id":61,"image":"kinghalo.webp","names":{"jp":"キングヘイロー","zh":"帝王光辉","aliases":["圣王光环"],"en":"King Halo"},"seiyuu":{"jp":"佐伯伊織","zh":"佐伯伊织","aliases":["佐伯伊织"],"en":"Saeki Iori"},"mainColor":"#0E9451","subColor":"#1C57A5"},{"id":62,"image":"matikanetannhauser.webp","names":{"jp":"マチカネタンホイザ","zh":"待兼唐怀瑟","aliases":["待兼诗歌剧"],"en":"Matikanetannhauser"},"seiyuu":{"jp":"遠野ひかる","zh":"远野光","aliases":["远野光"],"en":"Tono Hikaru"},"mainColor":"#0f8dce","subColor":"#ee5b56"},{"id":63,"image":"ikunodictus.webp","names":{"jp":"イクノディクタス","zh":"生野狄杜斯","aliases":["生野狄杜斯"],"en":"Ikuno Dictus"},"seiyuu":{"jp":"田澤茉純","zh":"田泽茉纯","aliases":["田泽茉纯"],"en":"Tazawa Masumi"},"mainColor":"#49b73f","subColor":"#c6d1d5"},{"id":64,"image":"mejiropalmer.webp","names":{"jp":"メジロパーマー","zh":"目白善信","aliases":["目白善信"],"en":"Mejiro Palmer"},"seiyuu":{"jp":"のぐちゆり","zh":"野口百合","aliases":["野口百合"],"en":"Noguchi Yuri"},"mainColor":"#27c79c","subColor":"#865432"},{"id":65,"image":"daitakuhelios.webp","names":{"jp":"ダイタクヘリオス","zh":"大拓太阳神","aliases":["大拓太阳神"],"en":"Daitaku Helios"},"seiyuu":{"jp":"山根綺","zh":"山根绮","aliases":["山根绮"],"en":"Yamane Aya"},"mainColor":"#5b64d5","subColor":"#fbe247"},{"id":66,"image":"twinturbo.webp","names":{"jp":"ツインターボ","zh":"双涡轮","aliases":["双涡轮"],"en":"Twin Turbo"},"seiyuu":{"jp":"花井美春","zh":"花井美春","aliases":["花井美春"],"en":"Hanai Miharu"},"mainColor":"#1985d2","subColor":"#27b784"},{"id":67,"image":"satonodiamond.webp","names":{"jp":"サトノダイヤモンド","zh":"里见光钻","aliases":["里见光钻"],"en":"Satono Diamond"},"seiyuu":{"jp":"立花日菜","zh":"立花日菜","aliases":["立花日菜"],"en":"Tachibina Hina"},"mainColor":"#94bf01","subColor":"#f9eb39"},{"id":68,"image":"kitasanblack.webp","names":{"jp":"キタサンブラック","zh":"北部玄驹","aliases":["北部玄驹"],"en":"Kitasan Black"},"seiyuu":{"jp":"矢野妃菜喜","zh":"矢野妃菜喜","aliases":["矢野妃菜喜"],"en":"Yano Hinaki"},"mainColor":"#5a6065","subColor":"#fc6d31"},{"id":69,"image":"sakurachiyonoo.webp","names":{"jp":"サクラチヨノオー","zh":"樱花千代王","aliases":["樱花千代王"],"en":"Sakura Chiyono O"},"seiyuu":{"jp":"野口瑠璃子","zh":"野口瑠璃子","aliases":["野口瑠璃子"],"en":"Noguchi Ruriko"},"mainColor":"#f9879d","subColor":"#f7dde2"},{"id":70,"image":"siriussymboli.webp","names":{"jp":"シリウスシンボリ","zh":"天狼星象征","aliases":["天狼星象征"],"en":"Sirius Symboli"},"seiyuu":{"jp":"ファイルーズあい","zh":"菲鲁兹·艾","aliases":["菲鲁兹·艾"],"en":"Fairouz Ai"},"mainColor":"#248379","subColor":"#e3628c"},{"id":71,"image":"mejiroardan.webp","names":{"jp":"メジロアルダン","zh":"目白阿尔丹","aliases":["目白雅丹"],"en":"Mejiro Ardan"},"seiyuu":{"jp":"会沢紗弥","zh":"会泽纱弥","aliases":["会泽纱弥"],"en":"Aizawa Saya"},"mainColor":"#28baa5","subColor":"#bfe4eb"},{"id":72,"image":"yaenomuteki.webp","names":{"jp":"ヤエノムテキ","zh":"八重无敌","aliases":["八重无敌"],"en":"Yaeno Muteki"},"seiyuu":{"jp":"日原あゆみ","zh":"日原步美","aliases":["日原步美"],"en":"Hihara Ayumi"},"mainColor":"#da483a","subColor":"#ffda93"},{"id":73,"image":"tsurumarutsuyoshi.webp","names":{"jp":"ツルマルツヨシ","zh":"鹤丸刚志","aliases":["鹤丸强志"],"en":"Tsurumaru Tsuyoshi"},"seiyuu":{"jp":"青山吉能","zh":"青山吉能","aliases":["青山吉能"],"en":"Aoyama Yoshino"},"mainColor":"#8F4DAC","subColor":"#F5CD47"},{"id":74,"image":"mejirobright.webp","names":{"jp":"メジロブライト","zh":"目白光明","aliases":["目白光明"],"en":"Mejiro Bright"},"seiyuu":{"jp":"大西綺華","zh":"大西绮华","aliases":["大西绮华"],"en":"Onishi Kika"},"mainColor":"#45C5C1","subColor":"#9F5F54"},{"id":75,"image":"daringtact.webp","names":{"jp":"デアリングタクト","zh":"谋勇兼备","aliases":["谋勇兼备"],"en":"Daring Tact"},"seiyuu":{"jp":"羊宮妃那","zh":"羊宫妃那","aliases":["羊宫妃那"],"en":"Hitsuji Hina"},"mainColor":"#79c6db","subColor":"#6c5953"},{"id":76,"image":"sakuralaurel.webp","names":{"jp":"サクラローレル","zh":"樱花桂冠","aliases":["樱花桂冠"],"en":"Sakura Laurel"},"seiyuu":{"jp":"真野美月","zh":"真野美月","aliases":["真野美月"],"en":"Mano Mizuki"},"mainColor":"#f0638a","subColor":"#fecdc9"},{"id":77,"image":"naritatoproad.webp","names":{"jp":"ナリタトップロード","zh":"成田路","aliases":["成田路"],"en":"Narita Top Road"},"seiyuu":{"jp":"中村カンナ","zh":"中村环奈","aliases":["中村栞奈"],"en":"Nakamura Kanna"},"mainColor":"#ea5bc0","subColor":"#8f3d7d"},{"id":78,"image":"yamaninzephyr.webp","names":{"jp":"ヤマニンゼファー","zh":"也文摄辉","aliases":["山人西风"],"en":"Yamanin Zephyr"},"seiyuu":{"jp":"今泉りおな","zh":"今泉理绪奈","aliases":["今泉理绪奈"],"en":"Imaizumi Riona"},"mainColor":"#5192C1","subColor":"#AE4544"},{"id":79,"image":"furioso.webp","names":{"jp":"フリオーソ","zh":"狂怒乐章","aliases":["狂怒乐章"],"en":"Furioso"},"seiyuu":{"jp":"西連寺亜希","zh":"西连寺亚希","aliases":["西连寺亚希"],"en":"Sairenji Aki"},"mainColor":"#3f54bf","subColor":"#dd3543"},{"id":80,"image":"transcend.webp","names":{"jp":"トランセンド","zh":"创升","aliases":["创昇"],"en":"Transcend"},"seiyuu":{"jp":"塚田悠衣","zh":"塚田悠衣","aliases":["塚田悠衣"],"en":"Tsukada Yui"},"mainColor":"#13a9b0","subColor":"#f8475f"},{"id":81,"image":"espoircity.webp","names":{"jp":"エスポワールシチー","zh":"希望之城","aliases":["希望城"],"en":"Espoir City"},"seiyuu":{"jp":"亜咲花","zh":"亚咲花","aliases":["亚咲花"],"en":"Asaka"},"mainColor":"#d93842","subColor":"#293aab"},{"id":82,"image":"northflight.webp","names":{"jp":"ノースフライト","zh":"北方飞翔","aliases":["北方飞翔"],"en":"North Flight"},"seiyuu":{"jp":"指出毬亜","zh":"指出毬亚","aliases":["指出毬亚"],"en":"Sashide Maria"},"mainColor":"#ca3b61","subColor":"#32b5d6"},{"id":83,"image":"symbolikriss.webp","names":{"jp":"シンボリクリスエス","zh":"吉兆","aliases":["克里斯象征"],"en":"Symboli Kris S"},"seiyuu":{"jp":"春川芽生","zh":"春川芽生","aliases":["春川芽生"],"en":"Harukawa Mei"},"mainColor":"#12762f","subColor":"#292d45"},{"id":84,"image":"taninogimlet.webp","names":{"jp":"タニノギムレット","zh":"谷水琴蕾","aliases":["谷野美酒","谷野琴酒","谷水琴酒","谷野琴蕾","谷野琴酒"],"en":"Tanino Gimlet"},"seiyuu":{"jp":"松岡美里","zh":"松冈美里","aliases":["松冈美里"],"en":"Matsuoka Miri"},"mainColor":"#dab610","subColor":"#173061"},{"id":85,"image":"daiichiruby.webp","names":{"jp":"ダイイチルビー","zh":"第一红宝石","aliases":["第一红宝"],"en":"Daiichi Ruby"},"seiyuu":{"jp":"礒部花凜","zh":"矶部花凛","aliases":["矶部花凛"],"en":"Isobe Karin"},"mainColor":"#d2445d","subColor":"#6946a9"},{"id":86,"image":"mejiroramonu.webp","names":{"jp":"メジロラモーヌ","zh":"目白高峰","aliases":["目白拉茉奴"],"en":"Mejiro Ramonu"},"seiyuu":{"jp":"東山奈央","zh":"东山奈央","aliases":["东山奈央"],"en":"Touyama Nao"},"mainColor":"#4bb6af","subColor":"#3c5161"},{"id":87,"image":"astonmachan.webp","names":{"jp":"アストンマーチャン","zh":"真弓快车","aliases":["阿斯顿真弓","奥斯顿真弓"],"en":"Aston Machan"},"seiyuu":{"jp":"井上ほの花","zh":"井上穗乃花","aliases":["井上穗乃花"],"en":"Inoue Honoka"},"mainColor":"#CF4436","subColor":"#E1DCCB"},{"id":88,"image":"satonocrown.webp","names":{"jp":"サトノクラウン","zh":"里见皇冠","aliases":["里见皇冠"],"en":"Satono Crown"},"seiyuu":{"jp":"鈴代紗弓","zh":"铃代纱弓","aliases":["铃代纱弓"],"en":"Suzushiro Sayumi"},"mainColor":"#21713A","subColor":"#F3F19D"},{"id":89,"image":"chevalgrand.webp","names":{"jp":"シュヴァルグラン","zh":"高尚骏逸","aliases":["高尚骏逸"],"en":"Cheval Grand"},"seiyuu":{"jp":"夏吉ゆうこ","zh":"夏吉优子","aliases":["夏吉优子"],"en":"Natsuyoshi Yuuko"},"mainColor":"#64C3C1","subColor":"#1E3872"},{"id":90,"image":"verxina.webp","names":{"jp":"ヴィルシーナ","zh":"极峰","aliases":["极峰"],"en":"Verxina"},"seiyuu":{"jp":"奥野香耶","zh":"奥野香耶","aliases":["奥野香耶"],"en":"Okuno Kaya"},"mainColor":"#4747cc","subColor":"#84c6e7"},{"id":91,"image":"vivlos.webp","names":{"jp":"ヴィブロス","zh":"极峰","aliases":["极峰"],"en":"Vivlos"},"seiyuu":{"jp":"伊藤彩沙","zh":"伊藤彩沙","aliases":["伊藤彩沙"],"en":"Ito Ayasa"},"mainColor":"#404fb1","subColor":"#84d4e3"},{"id":92,"image":"dantsuflame.webp","names":{"jp":"ダンツフレーム","zh":"烈焰快驹","aliases":["烈焰快驹"],"en":"Dantsu Flame"},"seiyuu":{"jp":"福嶋晴菜","zh":"福岛晴菜","aliases":["福岛晴菜"],"en":"Fukushima Haruna"},"mainColor":"#e97d97","subColor":"#119d76"},{"id":93,"image":"ksmiracle.webp","names":{"jp":"ケイエスミラクル","zh":"凯斯奇迹","aliases":["喜嘉奇迹"],"en":"K.S.Miracle"},"seiyuu":{"jp":"佐藤日向","zh":"佐藤日向","aliases":["佐藤日向"],"en":"Sato Hinata"},"mainColor":"#85aae1","subColor":"#ebd64a"},{"id":94,"image":"junglepocket.webp","names":{"jp":"ジャングルポケット","zh":"森林宝穴","aliases":["丛林口袋"],"en":"Jungle Pocket"},"seiyuu":{"jp":"藤本侑里","zh":"藤本侑里","aliases":["藤本侑里"],"en":"Fujimoto Yuri"},"mainColor":"#6ac43c","subColor":"#e6d734"},{"id":95,"image":"believe.webp","names":{"jp":"ビリーヴ","zh":"信念","aliases":["信念"],"en":"Believe"},"seiyuu":{"jp":"秋山実咲","zh":"秋山实咲","aliases":["秋山实咲"],"en":"Akiyama Misaki"},"mainColor":"#4baece","subColor":"#c63663"},{"id":96,"image":"noreason.webp","names":{"jp":"ノーリーズン","zh":"莫名其妙","aliases":["莫名其妙"],"en":"No Reason"},"seiyuu":{"jp":"河野ひより","zh":"河野日向","aliases":["河野日向"],"en":"Kono Hiyori"},"mainColor":"#cb243e","subColor":"#9ad2f5"},{"id":97,"image":"stillinlove.webp","names":{"jp":"スティルインラブ","zh":"爱如往昔","aliases":["爱如往昔"],"en":"Still in Love"},"seiyuu":{"jp":"宮下早紀","zh":"宫下早纪","aliases":["宫下早纪"],"en":"Miyashita Saki"},"mainColor":"#d83a43","subColor":"#6fbbf1"},{"id":98,"image":"copanorickey.webp","names":{"jp":"コパノリッキー","zh":"小林历奇","aliases":["小林历奇"],"en":"Copano Rickey"},"seiyuu":{"jp":"稲垣好","zh":"稻垣好","aliases":["稻垣好"],"en":"Inagaki Yoshi"},"mainColor":"#eeb42a","subColor":"#d93c49"},{"id":99,"image":"hokkotarumae.webp","names":{"jp":"ホッコータルマエ","zh":"北港火山","aliases":["北幸樽前"],"en":"Hokko Tarumae"},"seiyuu":{"jp":"菊池紗矢香","zh":"菊池纱矢香","aliases":["菊池纱矢香"],"en":"Kikuchi Sayaka"},"mainColor":"#d94149","subColor":"#cddee0"},{"id":100,"image":"wonderacute.webp","names":{"jp":"ワンダーアキュート","zh":"奇锐骏","aliases":["奇锐骏"],"en":"Wonder Acute"},"seiyuu":{"jp":"須藤叶希","zh":"须藤叶希","aliases":["须藤叶希"],"en":"Sudo Kanaki"},"mainColor":"#d85081","subColor":"#d8d2d9"},{"id":101,"image":"samsonbig.webp","names":{"jp":"サムソンビッグ","zh":"大森逊","aliases":["参孙大"],"en":"Samson Big"},"seiyuu":{"jp":"根本京里","zh":"根本京里","aliases":["根本京里"],"en":"Nemoto Kyori"},"mainColor":"#3dc3c2","subColor":"#f0688e"},{"id":102,"image":"soundsofearth.webp","names":{"jp":"サウンズオブアース","zh":"万籁争鸣","aliases":["地球之声"],"en":"Sounds of Earth"},"seiyuu":{"jp":"MAKIKO","zh":"MAKIKO","aliases":["MAKIKO"],"en":"MAKIKO"},"mainColor":"#ca4640","subColor":"#305991"},{"id":103,"image":"royceandroyce.webp","names":{"jp":"ロイスアンドロイス","zh":"莱斯莱斯","aliases":["罗伊斯兄弟"],"en":"Royce and Royce"},"seiyuu":{"jp":"田辺留依","zh":"田边留依","aliases":["田边留依"],"en":"Tanabe Rui"},"mainColor":"#e69a22","subColor":"#cc382e"},{"id":104,"image":"katsuragiace.webp","names":{"jp":"カツラギエース","zh":"葛城王牌","aliases":["葛城荣主"],"en":"Katsuragi Ace"},"seiyuu":{"jp":"藤原夏海","zh":"藤原夏海","aliases":["藤原夏海"],"en":"Fujiwara Natsumi"},"mainColor":"#7db0e0","subColor":"#f77696"},{"id":105,"image":"neouniverse.webp","names":{"jp":"ネオユニヴァース","zh":"新宇宙","aliases":["新宇宙"],"en":"Neo Universe"},"seiyuu":{"jp":"白石晴香","zh":"白石晴香","aliases":["白石晴香"],"en":"Shiraishi Haruka"},"mainColor":"#5abae6","subColor":"#f8db55"},{"id":106,"image":"hishimiracle.webp","names":{"jp":"ヒシミラクル","zh":"菱钻奇宝","aliases":["菱奇迹"],"en":"Hishi Miracle"},"seiyuu":{"jp":"春日さくら","zh":"春日樱","aliases":["春日樱"],"en":"Kasuga Sakura"},"mainColor":"#4a71b2","subColor":"#bdd1e9"},{"id":107,"image":"tapdancecity.webp","names":{"jp":"タップダンスシチー","zh":"跳舞城","aliases":["舞踏城"],"en":"Tap Dance City"},"seiyuu":{"jp":"篠田みなみ","zh":"篠田南","aliases":["篠田南"],"en":"Shinoda Minami"},"mainColor":"#d44853","subColor":"#4840ad"},{"id":108,"image":"duramente.webp","names":{"jp":"ドゥラメンテ","zh":"大鸣大放","aliases":["鸣声雷动"],"en":"Duramente"},"seiyuu":{"jp":"秋奈","zh":"秋奈","aliases":["秋奈"],"en":"Akina"},"mainColor":"#bf3344","subColor":"#4e4e4e"},{"id":109,"image":"rheinkraft.webp","names":{"jp":"ラインクラフト","zh":"莱茵力量","aliases":["莱茵力量"],"en":"Rhein Kraft"},"seiyuu":{"jp":"小島菜々恵","zh":"小岛菜菜惠","aliases":["小岛菜菜惠"],"en":"Kojima Nanane"},"mainColor":"#f15b75","subColor":"#2c9679"},{"id":110,"image":"cesario.webp","names":{"jp":"シーザリオ","zh":"西沙里奥","aliases":["西萨里奥"],"en":"Cesario"},"seiyuu":{"jp":"佐藤榛夏","zh":"佐藤榛夏","aliases":["佐藤榛夏"],"en":"Sato Haruka"},"mainColor":"#948eab","subColor":"#0a3874"},{"id":111,"image":"airmessiah.webp","names":{"jp":"エアメサイア","zh":"空中弥赛亚","aliases":["空中救世主"],"en":"Air Messiah"},"seiyuu":{"jp":"根本優奈","zh":"根本优奈","aliases":["根本优奈"],"en":"Nemoto Yuna"},"mainColor":"#2c2f9d","subColor":"#fffd8c"},{"id":112,"image":"daringheart.webp","names":{"jp":"デアリングハート","zh":"勇敢之心","aliases":["勇敢心"],"en":"Daring Heart"},"seiyuu":{"jp":"希水しお","zh":"希水汐","aliases":["希水汐"],"en":"Kizuki Shio"},"mainColor":"#d0ba00","subColor":"#38312b"},{"id":113,"image":"fusaichipandora.webp","names":{"jp":"フサイチパンドラ","zh":"房一潘多拉","aliases":["房一魔盒","火神"],"en":"Fusaichi Pandora"},"seiyuu":{"jp":"佳原萌枝","zh":"佳原萌枝","aliases":["佳原萌枝"],"en":"Kagahara Moeka"},"mainColor":"#fd637f","subColor":"#fbd872"},{"id":114,"image":"buenavista.webp","names":{"jp":"ブエナビスタ","zh":"迷人景致","aliases":["迷人景致"],"en":"Buena Vista"},"seiyuu":{"jp":"和泉風花","zh":"和泉风花","aliases":["和泉风花"],"en":"Izumi Fuka"},"mainColor":"#c0af3b","subColor":"#583d3e"},{"id":115,"image":"orfevre.webp","names":{"jp":"オルフェーヴル","zh":"黄金巨匠","aliases":["黄金巨匠"],"en":"Orfevre"},"seiyuu":{"jp":"日笠陽子","zh":"日笠阳子","aliases":["日笠阳子"],"en":"Hikasa Youko"},"mainColor":"#be4134","subColor":"#ecd898"},{"id":116,"image":"gentildonna.webp","names":{"jp":"ジェンティルドンナ","zh":"贵妇人","aliases":["贵妇人"],"en":"Gentildonna"},"seiyuu":{"jp":"芹澤優","zh":"芹泽优","aliases":["芹泽优"],"en":"Serizawa Yuu"},"mainColor":"#cf2f2b","subColor":"#533c3d"},{"id":117,"image":"winvariation.webp","names":{"jp":"ウインバリアシオン","zh":"凯旋芭蕾","aliases":["凯旋芭蕾"],"en":"Win Variation"},"seiyuu":{"jp":"月城日花","zh":"月城日花","aliases":["月城日花"],"en":"Tsukishiro Hika"},"mainColor":"#c1213c","subColor":"#bad7f4"},{"id":118,"image":"dreamjourney.webp","names":{"jp":"ドリームジャーニー","zh":"梦之旅","aliases":["梦之旅"],"en":"Dream Journey"},"seiyuu":{"jp":"吉岡茉祐","zh":"吉冈茉祐","aliases":["吉冈茉祐"],"en":"Yoshioka Mayu"},"mainColor":"#332d1f","subColor":"#e6e08a"},{"id":119,"image":"calstonelighto.webp","names":{"jp":"カルストンライトオ","zh":"金镇之光","aliases":["金镇之光"],"en":"Calstone Light O"},"seiyuu":{"jp":"望月ゆみこ","zh":"望月由美子","aliases":["望月由美子"],"en":"Mochizuki Yumiko"},"mainColor":"#131b4c","subColor":"#f7eb49"},{"id":120,"image":"durandal.webp","names":{"jp":"デュランダル","zh":"多旺达","aliases":["杜兰达尔"],"en":"Durandal"},"seiyuu":{"jp":"野木奏","zh":"野木奏","aliases":["野木奏"],"en":"Nogi Kanade"},"mainColor":"#efa605","subColor":"#d22630"},{"id":121,"image":"bubblegumfellow.webp","names":{"jp":"バブルガムフェロー","zh":"吹波糖","aliases":["吹波糖"],"en":"Bubble Gum Fellow"},"seiyuu":{"jp":"神谷早矢佳","zh":"神谷早矢佳","aliases":["神谷早矢佳"],"en":"Kamiya Sayaka"},"mainColor":"#e5bd00","subColor":"#0047bb"},{"id":122,"image":"sakurachitoseo.webp","names":{"jp":"サクラチトセオー","zh":"樱花千岁王","aliases":["樱花千岁王"],"en":"Sakura Chitose O"},"seiyuu":{"jp":"","zh":"","aliases":[],"en":""},"mainColor":"#FA83CB","subColor":"#D8C8D1"},{"id":123,"image":"blastonepiece.webp","names":{"jp":"ブラストワンピース","zh":"防爆装束","aliases":["防爆装束"],"en":"Blast Onepiece"},"seiyuu":{"jp":"紫月杏朱彩","zh":"紫月杏朱彩","aliases":["紫月杏朱彩"],"en":"Shizuki Anzu Sai"},"mainColor":"#009CBD","subColor":"#0CB85F"}]');
const dataloader_1iuvk8Fwgo = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  if (nuxtApp.ssrContext.__dataLoader) return;
  const validateData = (data, schema) => {
    return data.every((item) => {
      try {
        return Object.keys(schema.properties).every((key) => {
          if (schema.required.includes(key) && !item[key]) return false;
          return true;
        });
      } catch {
        return false;
      }
    });
  };
  const dataLoader = {
    async loadCharacters() {
      try {
        const data = await charactersData;
        return validateData(data, characterSchema) ? data : [];
      } catch (error) {
        console.error("数据加载失败:", error);
        return [];
      }
    }
  };
  if (!nuxtApp.$dataLoader) {
    nuxtApp.provide("dataLoader", dataLoader);
    nuxtApp.ssrContext.__dataLoader = true;
  }
});
let routes;
const prerender_server_LXx1wM9sKF = /* @__PURE__ */ defineNuxtPlugin(async () => {
  let __temp, __restore;
  if (!import.meta.prerender || hashMode) {
    return;
  }
  if (routes && !routes.length) {
    return;
  }
  (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules;
  routes || (routes = Array.from(processRoutes(([__temp, __restore] = executeAsync(() => {
    var _a;
    return (_a = routerOptions.routes) == null ? void 0 : _a.call(routerOptions, _routes);
  }), __temp = await __temp, __restore(), __temp) ?? _routes)));
  const batch = routes.splice(0, 10);
  prerenderRoutes(batch);
});
const OPTIONAL_PARAM_RE = /^\/?:.*(?:\?|\(\.\*\)\*)$/;
function shouldPrerender(path) {
  return true;
}
function processRoutes(routes2, currentPath = "/", routesToPrerender = /* @__PURE__ */ new Set()) {
  var _a;
  for (const route of routes2) {
    if (OPTIONAL_PARAM_RE.test(route.path) && !((_a = route.children) == null ? void 0 : _a.length) && shouldPrerender()) {
      routesToPrerender.add(currentPath);
    }
    if (route.path.includes(":")) {
      continue;
    }
    const fullPath = joinURL(currentPath, route.path);
    {
      routesToPrerender.add(fullPath);
    }
    if (route.children) {
      processRoutes(route.children, fullPath, routesToPrerender);
    }
  }
  return routesToPrerender;
}
const plugins = [
  payloadPlugin,
  unhead_KgADcZ0jPj,
  plugin$1,
  revive_payload_server_eJ33V7gbc6,
  plugin,
  components_plugin_KR1HBZs4kY,
  dataloader_1iuvk8Fwgo,
  dataloader_1iuvk8Fwgo,
  prerender_server_LXx1wM9sKF
];
const layouts = {};
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean, Object],
      default: null
    },
    fallback: {
      type: [String, Object],
      default: null
    }
  },
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const route = injectedRoute === useRoute() ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route.meta.layout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = ref();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    return () => {
      const hasLayout = layout.value && layout.value in layouts;
      const transitionProps = route.meta.layoutTransition ?? appLayoutTransition;
      return _wrapInTransition(hasLayout && transitionProps, {
        default: () => h(Suspense, { suspensible: true, onResolve: () => {
          nextTick(done);
        } }, {
          default: () => h(
            LayoutProvider,
            {
              layoutProps: mergeProps(context.attrs, { ref: layoutRef }),
              key: layout.value || void 0,
              name: layout.value,
              shouldProvide: !props.name,
              hasTransition: !!transitionProps
            },
            context.slots
          )
        })
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        isCurrent: (route) => name === (route.meta.layout ?? "default")
      });
    }
    return () => {
      var _a, _b;
      if (!name || typeof name === "string" && !(name in layouts)) {
        return (_b = (_a = context.slots).default) == null ? void 0 : _b.call(_a);
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const RouteProvider = defineComponent({
  props: {
    vnode: {
      type: Object,
      required: true
    },
    route: {
      type: Object,
      required: true
    },
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const __nuxt_component_1 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    const forkRoute = inject(PageRouteSymbol, null);
    let previousPageKey;
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    let vnode;
    const done = nuxtApp.deferHydration();
    if (props.pageKey) {
      watch(() => props.pageKey, (next, prev) => {
        if (next !== prev) {
          nuxtApp.callHook("page:loading:start");
        }
      });
    }
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          if (!routeProps.Component) {
            done();
            return;
          }
          const key = generateRouteKey$1(routeProps, props.pageKey);
          if (!nuxtApp.isHydrating && !hasChildrenRoutes(forkRoute, routeProps.route, routeProps.Component) && previousPageKey === key) {
            nuxtApp.callHook("page:loading:end");
          }
          previousPageKey = key;
          {
            vnode = h(Suspense, {
              suspensible: true
            }, {
              default: () => {
                const providerVNode = h(RouteProvider, {
                  key: key || void 0,
                  vnode: slots.default ? h(Fragment, void 0, slots.default(routeProps)) : routeProps.Component,
                  route: routeProps.route,
                  renderKey: key || void 0,
                  vnodeRef: pageRef
                });
                return providerVNode;
              }
            });
            return vnode;
          }
        }
      });
    };
  }
});
function hasChildrenRoutes(fork, newRoute, Component) {
  if (!fork) {
    return false;
  }
  const index = newRoute.matched.findIndex((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === (Component == null ? void 0 : Component.type);
  });
  return index < newRoute.matched.length - 1;
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLayout = __nuxt_component_0;
  const _component_NuxtPage = __nuxt_component_1;
  _push(ssrRenderComponent(_component_NuxtLayout, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtPage)
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/pages/runtime/app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import("./_nuxt/error-404-wP4XAbto.js"));
    const _Error = defineAsyncComponent(() => import("./_nuxt/error-500-BiKpIfDW.js"));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error = nuxt.payload.error || createError(error);
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);
export {
  _export_sfc as _,
  useRouter as a,
  resolveRouteObject as b,
  navigateTo as c,
  useRuntimeConfig as d,
  entry$1 as default,
  injectHead as i,
  nuxtLinkDefaults as n,
  resolveUnrefHeadInput as r,
  useNuxtApp as u
};
//# sourceMappingURL=server.mjs.map
