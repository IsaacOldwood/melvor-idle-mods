export function setup(ctx) {
  const button = selectAllButton();

  ctx.onInterfaceReady(() => {
    ui.create(
      button,
      document.getElementById("main-bank-move-mode").querySelector(`lang-string[lang-id="MENU_TEXT_CONFIRM_MOVE"]`)
        .parentElement.parentElement
    );
  });
}

function selectAllButton() {
  return {
    $template: "#bank-tab-select-all-button",
    selectAllInTab() {
      console.log("selecting all in tab");
      let tab = document.querySelector(`div[class="tab-pane active"]`);
      tab.children[0].children.forEach((item) => {
        item.click();
      });
    },
  };
}
