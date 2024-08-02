export function setup(ctx) {
  const button = selectAllButton();

  ctx.onInterfaceReady(() => {
    ui.create(
      button,
      document.getElementById("main-bank-move-mode").querySelector(`lang-string[lang-id="MENU_TEXT_CONFIRM_MOVE"]`)
        .parentElement.parentElement
    );
    // Move to before last element
    const newButton = document.getElementById("bank-tab-select-all");
    newButton.parentElement.insertBefore(newButton, newButton.previousElementSibling);
  });
}

function selectAllButton() {
  return {
    $template: "#bank-tab-select-all-button",
    selectAllInTab() {
      let tab = document.querySelector(`div[class="tab-pane active"]`).children[0].children;
      tab.forEach((item) => {
        if (item.className.includes("d-none")) {
          return;
        }
        item.click();
      });
    },
  };
}
