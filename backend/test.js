import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDvwNuMi9JNEdEo8gsQh_UnO4KcGrccfeI",{
  apiEndpoint: "https://us-central1-generativelanguage.googleapis.com"

});
async function main() {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const res = await model.generateContent("Explain AI in a few words");

  console.log(res.response.text());
}

main();
