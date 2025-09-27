const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Currency Converter API is running!");
});

// POST route for Dialogflow webhook
app.post("/", async (req, res) => {
  try {
    const data = req.body;

    const sourceCurrency = data.queryResult.parameters["unit-currency"].currency;
    const amount = data.queryResult.parameters["unit-currency"].amount;
    const targetCurrency = data.queryResult.parameters["currency-name"];

    // Fetch conversion factor
    const cf = await fetchConversionFactor(sourceCurrency, targetCurrency);
    const finalAmount = (amount * cf).toFixed(2);

    const response = {
      fulfillmentText: `${amount} ${sourceCurrency} is ${finalAmount} ${targetCurrency}`,
    };

    res.json(response);
  } catch (error) {
    console.error(error.message);
    res.json({ fulfillmentText: "⚠️ Error in currency conversion." });
  }
});

// Fetch conversion factor from FreeCurrencyAPI
async function fetchConversionFactor(source, target) {
  const API_KEY = "fca_live_juFJw0rWygGrmCPldd8U836aFMoOH7yBgbyGpZeX"; // your API key
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=${source},${target}`;

  const response = await axios.get(url);
  const rates = response.data.data;

  const sourceRate = rates[source];
  const targetRate = rates[target];

  return targetRate / sourceRate;
}

// Run server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
