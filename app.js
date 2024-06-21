const express = require("express");
const pokemonData = require("./models/pokemon.json");
const cors = require("cors");
const app = express();

app.use(cors()); // This will enable CORS for all routes

// Route for new project name generator
app.get("/:verb/:adjective/:noun", (req, res) => {
  const { verb, adjective, noun } = req.params;
  const message = `Congratulations on starting a new project called ${verb}-${adjective}-${noun}!`;
  res.send(message);
});

// Route for the home page (/bugs)
app.get("/bugs", (req, res) => {
  let bugCount = 99;
  let message = `${bugCount} little bugs in the code`;

  if (bugCount > 200) {
    message += `<br><a href="/">Start over</a>`;
  } else {
    message += `<br><a href="/bugs/${
      bugCount + 2
    }">Pull one down, patch it around</a>`;
  }

  res.send(message);
});

// Route for handling specific bug count (/bugs/:numberOfBugs)
app.get("/bugs/:numberOfBugs", (req, res) => {
  const bugCount = Number(req.params.numberOfBugs);
  let message = `${bugCount} little bugs in the code`;

  if (bugCount > 200) {
    message += `<br><a href="/">Start over</a>`;
  } else {
    message += `<br><a href="/bugs/${
      bugCount + 2
    }">Pull one down, patch it around</a>`;
  }

  res.send(message);
});

// Route for fetching all pokemon
app.get("/pokemon", (req, res) => {
  res.send(pokemonData);
});

// Route for searching pokemon by name or other attributes
app.get("/pokemon/search", (req, res) => {
  const query = req.query;

  const searchResult = pokemonData.filter((pokemon) => {
    for (const key in query) {
      const queryValue = query[key].toLowerCase();

      // Check if the attribute is a top-level key in the pokemon object
      if (pokemon[key]) {
        if (
          typeof pokemon[key] === "string" &&
          pokemon[key].toLowerCase() !== queryValue
        ) {
          return false;
        } else if (
          Array.isArray(pokemon[key]) &&
          !pokemon[key].map((val) => val.toLowerCase()).includes(queryValue)
        ) {
          return false;
        } else if (
          typeof pokemon[key] === "object" &&
          !Object.values(pokemon[key])
            .map((val) => val.toString().toLowerCase())
            .includes(queryValue)
        ) {
          return false;
        }
      } else {
        // Check nested objects (e.g., stats)
        let foundInNestedObject = false;
        for (const nestedKey in pokemon) {
          if (
            typeof pokemon[nestedKey] === "object" &&
            pokemon[nestedKey] !== null
          ) {
            if (
              pokemon[nestedKey][key] &&
              pokemon[nestedKey][key].toString().toLowerCase() === queryValue
            ) {
              foundInNestedObject = true;
              break;
            }
          }
        }
        if (!foundInNestedObject) {
          return false;
        }
      }
    }
    return true;
  });

  if (searchResult.length > 0) {
    res.json(searchResult);
  } else {
    res
      .status(404)
      .send(`Sorry, no pokemon found matching your search criteria`);
  }
});

// Route for fetching pokemon by index
app.get("/pokemon/:indexOfArray", (req, res) => {
  const { indexOfArray } = req.params;
  const index = parseInt(indexOfArray);

  // Check if the index is a valid number and within bounds
  if (!isNaN(index) && index >= 0 && index < pokemonData.length) {
    res.json(pokemonData[index]);
  } else {
    res.status(404).send(`Sorry, no pokemon found at /pokemon/${indexOfArray}`);
  }
});

// Helper function to generate styled HTML for a single Pokémon
function generatePokemonHTML(pokemon) {
  return `
    <html>
    <head>
      <title>${pokemon.name}</title>
      <style>
        body {
          background-color: #f2c611;
          font-family: 'Arial', sans-serif;
          color: #2d72d9;
          text-align: center;
        }
        h1 {
          color: #e3350d;
        }
        img {
          border: 5px solid #2d72d9;
          border-radius: 15px;
          margin-bottom: 20px;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          background-color: #fff;
          margin: 5px 0;
          padding: 10px;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <h1>${pokemon.name}</h1>
      <img src="http://img.pokemondb.net/artwork/${pokemon.name.toLowerCase()}.jpg" alt="${
    pokemon.name
  }">
      <h2>Type:</h2>
      <ul>
        ${pokemon.type.map((type) => `<li>${type}</li>`).join("")}
      </ul>
      <h2>Stats:</h2>
      <ul>
        ${Object.keys(pokemon.stats)
          .map(
            (stat) =>
              `<li><strong>${stat}:</strong> ${pokemon.stats[stat]}</li>`
          )
          .join("")}
      </ul>
      <h2>Damage Multipliers:</h2>
      <ul>
        ${Object.keys(pokemon.damages)
          .map(
            (damage) =>
              `<li><strong>${damage}:</strong> ${pokemon.damages[damage]}</li>`
          )
          .join("")}
      </ul>
      <h2>Miscellaneous:</h2>
      <ul>
        ${Object.keys(pokemon.misc)
          .map(
            (key) => `<li><strong>${key}:</strong> ${pokemon.misc[key]}</li>`
          )
          .join("")}
      </ul>
    </body>
    </html>
  `;
}

// Route for rendering Pokemon list with inline HTML
app.get("/pokemon-pretty", (req, res) => {
  let html = `
    <html>
    <head>
      <title>Pokemon List</title>
      <style>
        body {
          background-color: #f8d030; 
          font-family: Arial, sans-serif;
          text-align: center;
          color: #003a70; /* Blue for text */
        }
        .pokemon-list {
          list-style-type: none;
          padding: 0;
        }
        .pokemon-list li {
          margin-bottom: 10px;
        }
        .pokemon-link {
          color: #cc0000; 
          text-decoration: none;
        }
        .pokemon-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>Pokemon List</h1>
      <ul class="pokemon-list">
  `;

  pokemonData.forEach((pokemon, index) => {
    html += `<li><a class="pokemon-link" href="/pokemon-pretty/${index}">${pokemon.name}</a></li>`;
  });

  html += `</ul></body></html>`;
  res.send(html);
});

// Route for pretty search by name and other attributes
app.get("/pokemon-pretty/search", (req, res) => {
  const query = req.query;

  const searchResult = pokemonData.filter((pokemon) => {
    for (const key in query) {
      const queryValue = query[key].toLowerCase();

      // Check if the attribute is a top-level key in the pokemon object
      if (pokemon[key]) {
        if (
          typeof pokemon[key] === "string" &&
          pokemon[key].toLowerCase() !== queryValue
        ) {
          return false;
        } else if (
          Array.isArray(pokemon[key]) &&
          !pokemon[key].map((val) => val.toLowerCase()).includes(queryValue)
        ) {
          return false;
        } else if (
          typeof pokemon[key] === "object" &&
          !Object.values(pokemon[key])
            .map((val) => val.toString().toLowerCase())
            .includes(queryValue)
        ) {
          return false;
        }
      } else {
        // Check nested objects (e.g., stats)
        let foundInNestedObject = false;
        for (const nestedKey in pokemon) {
          if (
            typeof pokemon[nestedKey] === "object" &&
            pokemon[nestedKey] !== null
          ) {
            if (
              pokemon[nestedKey][key] &&
              pokemon[nestedKey][key].toString().toLowerCase() === queryValue
            ) {
              foundInNestedObject = true;
              break;
            }
          }
        }
        if (!foundInNestedObject) {
          return false;
        }
      }
    }
    return true;
  });

  if (searchResult.length > 0) {
    const html = searchResult.map(generatePokemonHTML).join("");
    res.send(html);
  } else {
    res
      .status(404)
      .send(`Sorry, no pokemon found matching your search criteria`);
  }
});

// Route for rendering individual Pokemon through index
app.get("/pokemon-pretty/:indexOfArray", (req, res) => {
  const { indexOfArray } = req.params;
  const index = parseInt(indexOfArray);

  if (!isNaN(index) && index >= 0 && index < pokemonData.length) {
    res.send(generatePokemonHTML(pokemonData[index]));
  } else {
    res.status(404).send(`Sorry, no pokemon found at /pokemon/${indexOfArray}`);
  }
});

module.exports = app;
