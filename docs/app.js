(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("Utils.js", function(exports, require, module) {
export const log = (m) => (v) => {
  console.log(m, v)
  return v
}

const secureImg = (url) =>
  url.match(/(https)./) ? url : url.replace("http", "https")

});

;require.register("components/hamburger.js", function(exports, require, module) {
export const Hamburger = {
  view: ({ attrs: { mdl } }) =>
    m(
      "button[type='button'].hamburger.hamburger--emphatic.js-hamburger",
      {
        class: mdl.status.sidebar ? "is-active" : "",
        onclick: (e) => (mdl.status.sidebar = !mdl.status.sidebar),
      },
      m("span.hamburger-box", m("span.hamburger-inner"))
    ),
}

});

;require.register("components/index.js", function(exports, require, module) {
export * from "./hamburger.js"
export * from "./sidebar.js"
export * from "./layout.js"

});

;require.register("components/layout.js", function(exports, require, module) {
import { Hamburger, SideBar } from "components"
import { animateCSS } from "styles/animations"

const Header = {
  view: ({ attrs: { mdl } }) => m(".header", m(Hamburger, { mdl })),
}

export const Layout = () => {
  return {
    view: ({ attrs: { mdl }, children }) =>
      m(".", [
        m(Header, { mdl }),
        children,
        mdl.status.sidebar &&
          m(SideBar, {
            oncreate: animateCSS("slideInRight"),
            mdl,
          }),
      ]),
  }
}

});

;require.register("components/loader.js", function(exports, require, module) {
const loader = m(".holder", [
  m(".preloader", [
    m("div"),
    m("div"),
    m("div"),
    m("div"),
    m("div"),
    m("div"),
    m("div"),
  ]),
])

export default loader

});

;require.register("components/sidebar.js", function(exports, require, module) {
import { AnimateSideBar } from "styles/animations"

export const SideBar = () => {
  let routeName = (route) => route.split("/")[1].toUpperCase()
  return {
    view: ({ attrs: { mdl } }) =>
      m(
        "ul.sidebar",
        { oncreate: AnimateSideBar("slideInLeft") },
        mdl.routes
          .filter((r) => r !== m.route.get())
          .map((route) =>
            m(
              m.route.Link,
              {
                href: route,
                selector: "li",
              },
              routeName(route)
            )
          )
      ),
  }
}

});

;require.register("index.js", function(exports, require, module) {
import routes from "./routes.js"
import model from "./model.js"

const root = document.body
let winW = window.innerWidth

if (module.hot) {
  module.hot.accept()
}

if ('production' == "development") {
  console.log("Looks like we are in development mode!")
} else {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("⚙️ SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("🧟 SW registration failed: ", registrationError)
        })
    })
  }
}

// set display profiles
const getProfile = (w) => {
  if (w < 668) return "phone"
  if (w < 920) return "tablet"
  return "desktop"
}

const checkWidth = (winW) => {
  const w = window.innerWidth
  if (winW !== w) {
    winW = w
    var lastProfile = model.settings.profile
    model.settings.profile = getProfile(w)
    if (lastProfile != model.settings.profile) m.redraw()
  }
  return requestAnimationFrame(checkWidth)
}

model.settings.profile = getProfile(winW)

checkWidth(winW)

if (sessionStorage.getItem("user")) {
  model.user = JSON.parse(sessionStorage.getItem("user"))
}

m.route(root, "/home", routes(model))

});

;require.register("initialize.js", function(exports, require, module) {
document.addEventListener("DOMContentLoaded", () => {
  require("./index.js")
})

});

;require.register("model.js", function(exports, require, module) {
const model = {
  state: {
    isLoading: false,
    loadingProgress: { max: 0, value: 0 },
    isLoggedIn: () => sessionStorage.getItem("token"),
  },
  routes: ["/home", "/portfolio", "/snippets", "/resume"],
  status: { sidebar: false },
  settings: {},
  slug: "",
}

export default model

});

;require.register("pages/home.js", function(exports, require, module) {
export const Home = () => {
  return {
    view: () => m(".page", 'HOME'),
  }
}

});

;require.register("pages/index.js", function(exports, require, module) {
export * from "./home"
export * from "./portfolio"
export * from "./snippets"
export * from "./resume"

});

;require.register("pages/portfolio.js", function(exports, require, module) {
export const Portfolio = () => {
  return {
    view: () => m(".page", "PORTFOLIO"),
  }
}

});

;require.register("pages/resume.js", function(exports, require, module) {
export const Resume = () => {
  return {
    view: () => m(".page", "RESUME"),
  }
}

});

;require.register("pages/snippets.js", function(exports, require, module) {
export const Snippets = () => {
  return {
    view: () => m(".page", "SNIPPETS"),
  }
}

});

;require.register("routes.js", function(exports, require, module) {
import { Layout } from "components"
import { animatePageCSS } from "styles/animations"
import { Home, Portfolio, Snippets, Resume } from "pages"
import { log } from "Utils"

const routes = (mdl) => {
  return {
    "/home": {
      onmatch: (_, b) => {
        mdl.slug = b
        mdl.status.sidebar = false
      },
      render: () =>
        m(
          Layout,
          { mdl },
          m(Home, {
            oncreate: animatePageCSS("slideInLeft"),
            onbeforeremove: animatePageCSS("slideOutRight"),
            mdl,
          })
        ),
    },

    "/portfolio": {
      onmatch: (_, b) => {
        mdl.slug = b
        mdl.status.sidebar = false
      },
      render: () =>
        m(
          Layout,
          { mdl },
          m(Portfolio, {
            oncreate: animatePageCSS("slideInLeft"),
            onbeforeremove: animatePageCSS("slideOutRight"),
            mdl,
          })
        ),
    },

    "/resume": {
      onmatch: (_, b) => {
        mdl.slug = b
        mdl.status.sidebar = false
      },
      render: () =>
        m(
          Layout,
          { mdl },
          m(Resume, {
            oncreate: animatePageCSS("slideInLeft"),
            onbeforeremove: animatePageCSS("slideOutRight"),
            mdl,
          })
        ),
    },

    "/snippets": {
      onmatch: (_, b) => {
        mdl.slug = b
        mdl.status.sidebar = false
      },
      render: () =>
        m(
          Layout,
          { mdl },
          m(Snippets, {
            oncreate: animatePageCSS("slideInLeft"),
            onbeforeremove: animatePageCSS("slideOutRight"),
            mdl,
          })
        ),
    },
  }
}

export default routes

});

;require.register("styles/animations.js", function(exports, require, module) {
export const animatePageCSS = (animation, prefix = "animate__") => ({ dom }) =>
  new Promise((resolve) => {
    let cs = [...dom.classList].filter((c) => !c.includes("animate__"))
    dom.classList = cs
    dom.classList.add(`${prefix}animated`, `${prefix}${animation}`)
    dom.style.position = "absolute"
    dom.style.top = -19
    dom.style.width = "100%"

    setTimeout(() => {
      dom.style.position = ""
      dom.style.top = ""
      resolve()
    }, 1000)
  })

export const animateCSS = (animation, prefix = "animate__") => ({ dom }) =>
  new Promise((resolve) => {
    let cs = [...dom.classList].filter((c) => !c.includes("animate__"))
    dom.classList = cs
    dom.classList.add(`${prefix}animated`, `${prefix}${animation}`)

    setTimeout(() => {
      resolve()
    }, 1000)
  })

export const SlideChildrenInRight = (animation) => ({ dom }) => {
  let children = [...dom.children]

  return children.map((child, idx) => {
    child.style.opacity = 0
    setTimeout(() => {
      child.style.opacity = 1
      animateCSS(animation)({ dom: child })
    }, idx * 100)
  })
}

export const AnimateSideBar = (animation) => ({ dom }) =>
  SlideChildrenInRight(animation)({ dom })

});

;require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.m = require("mithril");


});})();require('___globals___');

