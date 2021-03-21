const App = {
  oncreate: ({ dom, state }) => {
    state.pane = new CupertinoPane(
      dom, //pane container
      {
        parentElement: "body",
        breaks: {
          top: { enabled: true, height: 500, bounce: true },
          middle: { enabled: true, height: 300, bounce: true },
          bottom: { enabled: true, height: 80 },
        },
        onDrag: (a) => console.log("Drag event", a),
      }
    )
    state.pane.present({ animate: true })
  },
  view: () =>
    m(
      ".cupertino-pane",
      { style: { margin: "20px" } },
      m("h1", "Header"),
      m(".content", "content")
    ),
}

m.mount(document.body, App)
