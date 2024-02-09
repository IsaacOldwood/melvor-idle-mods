export function setup(ctx) {
  const museum_tokens = MuseumTokens(0);

  ctx.onInterfaceReady(() => {
    museum_tokens.update(game.bank.getQty(game.items.getObjectByID("melvorAoD:Museum_Token")));
    ui.create(museum_tokens, document.getElementById("shop-current-slayer-c").parentElement);
  });

  ctx.patch(Bank, "addItem").after((didAddItem, item, quantity, ...args) => {
    console.log("5");
    museum_tokens.update(game.bank.getQty(game.items.getObjectByID("melvorAoD:Museum_Token")));
  });
}

function MuseumTokens(token_count) {
  return {
    $template: "#museum-token-count-component",
    token_count: token_count,
    update(token_count) {
      this.token_count = token_count;
    },
  };
}
