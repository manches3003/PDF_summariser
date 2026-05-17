export async function summarisePDF(text) {
  const chunks = splitIntoChunks(text, 900)
  const summaries = []

  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: chunk,
            parameters: { max_length: 250, min_length: 80, do_sample: false },
          }),
        }
      )
      const data = await response.json()
      if (data[0]?.summary_text) {
        summaries.push(data[0].summary_text)
      }
    } catch (err) {
      console.error('HF chunk error:', err)
    }
  }

  return summaries.join('\n\n')
}

export function extractKeyTopics(summaryText) {
  const sentences = summaryText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30)

  return sentences.slice(0, 6).map((sentence, i) => ({
    id: i + 1,
    point: sentence,
  }))
}

function splitIntoChunks(text, wordsPerChunk) {
  const words = text.split(/\s+/)
  const chunks = []
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '))
  }
  return chunks.slice(0, 6) // max 6 chunks to stay within free tier limits
}