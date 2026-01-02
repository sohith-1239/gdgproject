
import { GoogleGenAI, Type } from "@google/genai";
import { ExamAnalysis } from "../types";

export async function analyzeExamSheet(
  fileBase64: string,
  fileName: string,
  studentName: string,
  studentId: string
): Promise<ExamAnalysis> {
  // Fix: Create GoogleGenAI instance inside function to ensure latest API key access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        {
          text: `SYSTEM INSTRUCTION: You are a Backend Processing Engine for "Performance Review Package".
          
          PIPELINE STEPS:
          1. OCR & CLEAN: Extract all text from the provided image/document. Remove noise and formatting artifacts.
          2. SEGMENTATION: Break the text into distinct Question-Answer segments.
          3. TOPIC MAPPING: For each QA segment, determine which overarching Topic/Unit it belongs to (e.g. "Algebra", "Calculus").
          4. SCORING: Evaluate the answer quality and assign a score.
          5. FOLDER GENERATION: Organize the data into a structure that mimics a topic-based filesystem.

          INPUT: 
          Student: ${studentName} (${studentId})
          File: ${fileName}

          RESPONSE REQUIREMENTS:
          - Return a strict JSON object.
          - Ensure "segments" within each topic contain the specific text of the questions and answers.
          - Provide expert, constructive feedback for every segment.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: fileBase64,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING, description: "The unit/topic folder name" },
                score: { type: Type.NUMBER },
                maxScore: { type: Type.NUMBER },
                feedback: { type: Type.STRING },
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionNumber: { type: Type.STRING },
                      questionText: { type: Type.STRING },
                      studentAnswer: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                      maxScore: { type: Type.NUMBER },
                      feedback: { type: Type.STRING }
                    },
                    required: ["questionText", "studentAnswer", "score", "feedback"]
                  }
                }
              },
              required: ["topic", "score", "maxScore", "feedback", "segments"]
            }
          },
          rawText: { type: Type.STRING }
        },
        required: ["subject", "overallScore", "topics"]
      }
    }
  });

  // Fix: Correctly access the .text property (not a method) from the response
  const text = response.text;
  if (!text) throw new Error("Backend processing failed to return analysis.");
  
  const parsed = JSON.parse(text);
  return {
    ...parsed,
    studentName,
    studentId,
    examDate: new Date().toLocaleDateString()
  } as ExamAnalysis;
}
