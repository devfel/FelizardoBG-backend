// src/api/oferta/controllers/oferta.js
"use strict";

/**
 * oferta controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::oferta.oferta", {
  async create(ctx) {
    const user = ctx.state.user;

    const task = await super.create(ctx);

    const updated = await strapi.entityService.update(
      "api::oferta.oferta",
      task.data.id,
      {
        data: {
          usuario_fez_oferta_id: user.id,
          UsuarioDaOfertaID: user.id,
        },
      }
    );

    console.log("Finishing create to add UsuarioDaOfertaID");
    return updated;
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    // Fetch the existing oferta entry to check ownership
    const existingOferta = await strapi.entityService.findOne(
      "api::oferta.oferta",
      id,
      {
        fields: ["id"], // Minimize the amount of data fetched
        populate: { usuario_fez_oferta_id: true }, // Ensure the user who made the offer is populated
      }
    );

    if (!existingOferta) {
      // Entry not found
      return ctx.notFound("The oferta does not exist.");
    }

    // Check if the current user is the one who made the offer
    if (existingOferta.usuario_fez_oferta_id?.id !== user.id) {
      // User is not the one who made the offer, return a forbidden response
      return ctx.forbidden("You are not allowed to delete this oferta.");
    }

    // If the user is the one who made the offer, proceed with the delete
    return super.delete(ctx);
  },
});
