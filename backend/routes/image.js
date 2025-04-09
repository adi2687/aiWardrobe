// filmFetcher.ts

import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const Film = z.object({
  name: z.string(),
  year: z.number(),
  director: z.string(),
  cast: z.array(z.string()),
  genre: z.enum(["drama", "thriller", "sci-fi", "comedy", "horror", "fantasy"]),
});

const client = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

export default async function fetchFilmDetails(actor) {
  const completion = await client.chat.completions.create({
    model: "mistralai/Mistral-Nemo-Instruct-2407-fast",
    messages: [
      {
        role: "system",
        content:
          "I will give you an actor or actress, and you will respond with details of a real film they have starred in, according to the provided structure.",
      },
      {
        role: "user",
        content: actor,
      },
    ],
    extra_body: {
      guided_json: zodResponseFormat(Film, "film").json_schema.schema,
    },
  });

  const message = completion.choices[0]?.message;

  if (message?.refusal) {
    throw new Error(`Model refused to answer: ${message.refusal}`);
  }

  if (!message?.content) {
    throw new Error("No content returned from model.");
  }

  const parsed = Film.parse(JSON.parse(message.content));
  return parsed;
}
