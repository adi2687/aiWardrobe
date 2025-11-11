import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
 const completion = await openai.chat.completions.create({
  model: "qwen/qwen3-vl-8b-instruct",
  max_tokens: 500, // 👈 Add this line
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What is in this image?" },
        {
          type: "image_url",
          image_url: {
            url: "https://res.cloudinary.com/dvxvgmhyg/image/upload/v1749218106/uploads/bphxd73dehoc7iyrnpi5.jpg",
          },
        },
      ],
    },
  ],
});


  console.log(completion.choices[0].message);
}

main();