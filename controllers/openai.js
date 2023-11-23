const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.createImage = async (req, res, next) => {
  // Get the prompt from the request
  // const { prompt } = req.body;
  const prompt = "Generate a clean and concise slide for a lecture presentation on React Hooks, specifically focusing on the useState Hook. Keep the design minimal with a title and key points. The goal is to present the information in an easily digestible format for students. Assume a basic understanding of React among the audience.";

  // Generate image from prompt
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    style: 'natural',
    quality: 'hd',
    size: "1024x1024",
  });
  // Send back image url
  console.log(response.data[0].url)
  res.send(response.data[0].url);
};