import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { imageBase64 } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

        const prompt = "Act as a medical document analyzer. Extract the patient's name, age, gender, and any medical conditions (cardiovascular, respiratory, or metabolic) from this image or file content. Respond in JSON format only: { name: string, age: number, conditions: { cardiovascular: boolean, respiratory: boolean, metabolic: boolean }, specific: string[] }";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: imageBase64
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Clean up JSON from markdown if exists
        const cleanJson = resultText.replaceAll('```json', '').replaceAll('```', '').trim();
        return NextResponse.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error('OCR Error:', error);
        return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
    }
}
