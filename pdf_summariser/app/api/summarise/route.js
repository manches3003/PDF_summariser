import { NextResponse } from 'next/server'
import { summarisePDF, extractKeyTopics } from '@/lib/summarise'

export async function POST(request) {
  try {
    const { text, fileName } = await request.json()

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'PDF text is too short or could not be extracted.' },
        { status: 400 }
      )
    }

    const summary = await summarisePDF(text)

    if (!summary || summary.trim().length === 0) {
      return NextResponse.json(
        { error: 'Summarisation failed. The model may be loading, please try again in 20 seconds.' },
        { status: 500 }
      )
    }

    const keyTopics = extractKeyTopics(summary)

    return NextResponse.json({ summary, keyTopics, fileName })
  } catch (err) {
    console.error('Summarise route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}