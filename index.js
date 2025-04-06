const fs = require("fs");
const https = require("https");

// Fallback quotes if both APIs fail
const fallbackQuotes = [
  { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  {
    quote: "The best way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    quote:
      "Do not be embarrassed by your failures, learn from them and start again.",
    author: "Richard Branson",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    quote: "Whether you think you can or you think you can’t, you’re right.",
    author: "Henry Ford",
  },
  {
    quote:
      "Your time is limited, so don’t waste it living someone else’s life.",
    author: "Steve Jobs",
  },
  { quote: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { quote: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { quote: "What we think, we become.", author: "Buddha" },
  { quote: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
];

// Function to make HTTPS GET request
function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`Status Code: ${res.statusCode}`));
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function fetchQuote() {
  console.log("🔍 Trying adviceslip.com...");
  try {
    const data = await get("https://api.adviceslip.com/advice");
    const json = JSON.parse(data);
    return {
      quote: json.slip.advice,
      author: null,
      source: "adviceslip",
    };
  } catch (err) {
    console.warn("⚠️ adviceslip.com failed:", err.message);
  }

  console.log("🔄 Trying zenquotes.io...");
  try {
    const data = await get("https://zenquotes.io/api/random");
    const json = JSON.parse(data);
    return {
      quote: json[0].q,
      author: json[0].a,
      source: "zenquotes",
    };
  } catch (err) {
    console.warn("⚠️ zenquotes.io failed:", err.message);
  }

  console.log("💡 Falling back to hardcoded quotes...");
  const random =
    fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  return {
    quote: random.quote,
    author: random.author,
    source: "fallback",
  };
}

async function init() {
  try {
    let readData = fs.readFileSync("README.md", "utf8");

    const { quote, author, source } = await fetchQuote();

    let finalQuoteBlock = `<!-- ADVICE:START -->\n<p align="center"><br><i>${quote}</i>`;
    if (author) {
      finalQuoteBlock += `<br>— ${author}`;
    }
    finalQuoteBlock += `</p>\n<!-- ADVICE:END -->`;

    console.log(
      `✅ Quote fetched from ${source}: "${quote}"${
        author ? " — " + author : ""
      }`
    );

    readData = readData.replace(
      /(?:<!-- ADVICE:START -->)([\s\S]*?)(?:<!-- ADVICE:END -->)/g,
      finalQuoteBlock
    );

    fs.writeFile("README.md", readData, (err) => {
      if (err) {
        console.error("❌ Error writing to README.md:", err);
      } else {
        console.log("✅ README.md updated successfully!");
      }
    });
  } catch (err) {
    console.error("🔥 Unexpected error:", err.message);
  }
}

init();
