// ./src/index.js
"use strict";
const cron = require("node-cron");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      // // After creating a new user, run the crawler to fetch games from Ludopedia
      // async afterCreate(event) {
      //   const { result } = event;
      //   if (result.usuarioLudopedia) {
      //     await runCrawlerAndUpdateProducts(result);
      //   }
      // },

      // After updating a user, run the crawler to fetch games from Ludopedia
      async afterUpdate(event) {
        const { result } = event;

        // Delete all external-bg entries for this user
        console.log(`Deleting all products for user ID: ${result.id}`);
        await strapi.entityService.deleteMany("api::external-bg.external-bg", {
          filters: { donocodid: result.id },
        });

        // After deletion, run the crawler for the new Ludopedia username
        if (result.usuarioLudopedia) {
          console.log(
            "Fetching products for updated username:",
            result.usuarioLudopedia
          );
          await runCrawlerAndUpdateProducts(result);
        }
      },
    });

    // Schedule a task to update Ludopedia games daily for all users with valid usuarioLudopedia
    cron.schedule("0 1 * * *", async () => {
      console.log(
        "Running daily update of Ludopedia data for all users at 1 AM"
      );

      // Fetch all users with a Ludopedia username
      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: { usuarioLudopedia: { $notNull: true } },
          fields: ["id", "email", "nomeUsuario", "usuarioLudopedia"],
        }
      );

      for (const [index, user] of users.entries()) {
        const userPosition = index + 1;
        console.log(
          `Updating products for user: ${user.usuarioLudopedia} (${userPosition}/${users.length})`
        );

        // Delete old entries
        await strapi.entityService.deleteMany("api::external-bg.external-bg", {
          filters: { donocodid: user.id },
        });

        // Fetch new products from Ludopedia
        await runCrawlerAndUpdateProducts(user);

        // Wait for one minute before processing the next user
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    });
  },
};

async function runCrawlerAndUpdateProducts(user) {
  console.log("Fetching products for:", user.usuarioLudopedia);
  const { fetchData } = require("./utils/crawlerLudopedia");

  try {
    const products = await fetchData(
      user.usuarioLudopedia,
      user.email,
      user.nomeUsuario
    );
    console.log(
      `Found ${products.length} new products for user: ${user.usuarioLudopedia}`
    );

    for (const product of products) {
      try {
        await strapi.entityService.create("api::external-bg.external-bg", {
          data: {
            bgnomeludopedia: product.bgnomeludopedia,
            precoludopedia: product.precoludopedia,
            condicaoludopedia: product.condicaoludopedia,
            imagemludopedia: product.imagemludopedia,
            linkprodutoludopedia: product.linkprodutoludopedia,
            vendaouleilao: product.vendaouleilao,
            federacaoludopedia: product.federacaoludopedia,
            cidadeludopedia: product.cidadeludopedia,
            dononome: user.nomeUsuario,
            donoemail: user.email,
            donoid: user.id,
            donocodid: user.id,
            donouserludopedia: user.usuarioLudopedia,
            descricaoludopedia: product.descricaoludopedia,
            terminaemludopedia: product.terminaemludopedia,
          },
        });
        console.log("Product saved:", product.bgnomeludopedia);
      } catch (error) {
        console.error("Error saving product:", error);
      }
    }
  } catch (error) {
    console.error("Error during crawling and updating:", error);
  }
}
