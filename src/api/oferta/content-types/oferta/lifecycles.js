// src/api/oferta/lifecycles.js
module.exports = {
  async afterCreate(event) {
    console.log("Event Result at afterCreate: ", event.result);
    console.log("BoardGame at afterCreate: ", event.result.board_game);
    const boardGameObj = event.result.board_game;
    if (boardGameObj) {
      await updateMaiorOferta(boardGameObj);
    }
  },
  async afterUpdate(event) {
    const boardGameObj = event.result;
    console.log("Event Result at afterUpdate: ", event.result);
    console.log("BoardGame at afterUpdate: ", event.result.board_game);
    if (boardGameObj) {
      await updateMaiorOferta(boardGameObj);
    }
  },

  async beforeDelete(event) {
    const ofertaId = event.params.where.id;
    const oferta = await strapi.entityService.findOne(
      "api::oferta.oferta",
      ofertaId,
      {
        populate: ["board_game"],
      }
    );

    if (oferta && oferta.board_game) {
      const boardGameObj = oferta.board_game;
      console.log(`Board game ID to update: ${boardGameObj.id}`);
      await updateMaiorOferta(boardGameObj, ofertaId);
    }
  },
};

async function updateMaiorOferta(boardGame, excludeOfertaId = null) {
  console.log(
    "At updateMaiorOferta",
    " Board Game: ",
    boardGame,
    " Exclude Oferta: ",
    excludeOfertaId
  );
  const boardGameId = boardGame.id; // Extract the ID from the boardGame object

  try {
    const ofertas = await strapi.entityService.findMany("api::oferta.oferta", {
      filters: { board_game: boardGameId },
    });

    // Filter out the oferta being deleted, if delete was choosen
    const filteredOfertas = excludeOfertaId
      ? ofertas.filter((oferta) => oferta.id !== excludeOfertaId)
      : ofertas;

    let maiorOferta;
    console.log("Board Game ID: ", boardGameId);
    console.log("Ofertas: ", filteredOfertas);

    if (filteredOfertas.length > 0) {
      maiorOferta = filteredOfertas.reduce(
        (max, oferta) => Math.max(max, oferta?.ValorOferta || 0),
        0
      );
    } else {
      // Explicitly set to null when no ofertas are found
      maiorOferta = null;
    }

    console.log("MaiorOferta:", maiorOferta);

    // Use the boardGameId here for the update the MaiorOferta field
    await strapi.entityService.update(
      "api::board-game.board-game",
      boardGameId,
      {
        data: { MaiorOferta: maiorOferta },
      }
    );
  } catch (error) {
    console.error("Error updating MaiorOferta:", error);
  }
}
