// DEPENDENCIES
const app = require("./app.js");

// CONFIGURATION
require("dotenv").config();
const PORT = process.env.PORT;
// console.log(PORT);
// console.log(process.env);
// console.log(process.env.NODE_ENV);

// LISTEN
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
