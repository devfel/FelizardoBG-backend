// ./src/utils/crawlerLudopedia.js
const axios = require("axios");
const cheerio = require("cheerio");

async function fetchData(userNameLudo, email, nomeCompleto) {
  const url = `https://ludopedia.com.br/anuncios?usuario=${encodeURIComponent(
    userNameLudo
  )}`;
  const result = await axios.get(url);
  const $ = cheerio.load(result.data);
  const products = [];

  console.log("Fetching data from:", url);

  if (
    !$(".alert.alert-success").text().includes("Exibindo apenas anúncios de")
  ) {
    console.log("Not exclusively user's products, because user not found.");
    return [];
  }

  $(".box-anuncio").each((index, element) => {
    const nome = $(element).find("a.link-elipsis").text().trim();
    const imagem = $(element).find("img.img-rounded").attr("src");
    const link = $(element).find("a.btn").attr("href");
    const tipo = $(element).find(".box-anuncio-title").text().trim(); // Venda or Leilão
    const preco = $(element).find(".proximo_lance").text().trim();
    const condicaoRaw = $(element).find("dt").text().trim();
    const condicaoMatch = condicaoRaw.match(/\(([^)]+)\)/);
    const condicao = condicaoMatch ? condicaoMatch[1] : "Desconhecido";
    const local = $(element).find("dd").first().text().trim();
    const [estado, cidade] = local.split(" - ");
    const descricao = $(element).find(".anuncio-sub-titulo").text().trim();
    const terminaEm = $(element)
      .find("dt")
      .filter(function () {
        return $(this).text().trim() === "Termina em";
      })
      .next("dd")
      .text()
      .trim();

    products.push({
      bgnomeludopedia: nome,
      precoludopedia: preco,
      condicaoludopedia: condicao,
      imagemludopedia: imagem,
      linkprodutoludopedia: link,
      vendaouleilao: tipo,
      federacaoludopedia: estado,
      cidadeludopedia: cidade,
      dononome: nomeCompleto,
      donoemail: email,
      donouserludopedia: userNameLudo,
      descricaoludopedia: descricao,
      terminaemludopedia: terminaEm,
    });
  });

  return products;
}

module.exports = { fetchData };
