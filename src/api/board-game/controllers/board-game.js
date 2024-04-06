"use strict";

/**
 * board-game controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// module.exports = createCoreController("api::board-game.board-game");

module.exports = createCoreController("api::board-game.board-game", {
  async create(ctx) {
    // user is authenticated and part of the context
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest("User not authenticated");
    }

    // Start a transaction
    const result = await strapi.db.transaction(async (trx) => {
      // Create a new board game entry within the transaction
      const task = await super.create(ctx, { trx });

      // Update the newly created board game entry with the owner information, also within the transaction
      const updated = await strapi.entityService.update(
        "api::board-game.board-game",
        task.data.id,
        {
          data: {
            owner: user.id,
            OwnerID: user.id,
          },
          trx, // Pass the transaction object to ensure this operation is part of the transaction
        }
      );

      return updated;
    });

    return result;
  },

  async update(ctx) {
    console.log("Update request by user:", ctx.state.user.id);

    // Retrieve the ID of the board game being updated from the request
    const { id } = ctx.params;

    // Fetch the existing board-game entry to check ownership
    const existingEntry = await strapi.entityService.findOne(
      "api::board-game.board-game",
      id,
      {
        fields: ["id"], // Minimize the amount of data fetched
        populate: { owner: true }, // Ensure the owner field is populated
      }
    );

    if (!existingEntry) {
      // Entry not found
      return ctx.notFound("The board game does not exist.");
    }

    // Check if the current user is the owner
    if (existingEntry.owner?.id !== ctx.state.user.id) {
      // User is not the owner, return a forbidden response
      return ctx.forbidden("You are not allowed to update this board game.");
    }

    // If the user is the owner, proceed with the update
    return super.update(ctx);
  },
});
