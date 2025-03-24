
// Default Gemini API key - In production, this should be stored securely
// and accessed via environment variables
const DEFAULT_API_KEY = 'AIzaSyAc_JdIBzWO113OC6dnXFcFstR39i5_OEc';

export interface GeminiResponse {
  mappings: Record<string, string | null>;
  success: boolean;
  error?: string;
}

/**
 * Analyze column data with Google's Gemini AI
 * @param columns Array of column names from the Excel file
 * @param sampleData Sample rows of data for context
 * @param expectedColumns Target columns for mapping
 * @returns Promise with mapping suggestions or error
 */
export const analyzeColumnsWithGemini = async (
  columns: string[],
  sampleData: any[][],
  expectedColumns: {id: string, label: string, required: boolean}[]
): Promise<GeminiResponse> => {
  try {
    // Prepare sample data for the API
    const samples: Record<string, any[]> = {};
    columns.forEach((col, idx) => {
      samples[col] = sampleData.map(row => row[idx]);
    });
    
    // Create prompt for Gemini
    const prompt = `
I have an Excel sheet with the following columns: ${columns.join(', ')}

Here are some sample values for each column:
${columns.map((col, idx) => {
  return `${col}: ${sampleData.map(row => row[idx]).filter(Boolean).slice(0, 3).join(', ')}`;
}).join('\n')}

I need to map these columns to my Talent Management System which requires the following fields:
${expectedColumns.map(col => `- ${col.label}${col.required ? ' (Required)' : ''}`).join('\n')}

Please map my Excel columns to the system fields. Return your answer ONLY as a valid JSON object where keys are my Excel column names and values are the corresponding system field IDs. If a column doesn't map to any system field, assign null as its value.

The response should be in this format exactly:
{
  "Excel Column Name 1": "system_field_id_1",
  "Excel Column Name 2": "system_field_id_2",
  "Excel Column Name 3": null
}
`;

    console.log("Sending prompt to Gemini:", prompt.substring(0, 200) + "...");

    // Call Gemini API with retry mechanism
    const maxRetries = 2;
    let lastError: any = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add a small delay between retries
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': DEFAULT_API_KEY
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,  // Lower temperature for more deterministic results
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned status ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
          console.error("Invalid response from Gemini API:", result);
          throw new Error('Failed to get a valid response from Gemini API');
        }
        
        // Extract the JSON response from Gemini's text
        const responseText = result.candidates[0].content.parts[0].text;
        console.log("Gemini response:", responseText);
        
        // Improved JSON extraction with multiple patterns
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                          responseText.match(/```\n([\s\S]*?)\n```/) ||
                          responseText.match(/{[\s\S]*?}/);
                          
        let mappings: Record<string, string | null> = {};
        
        if (jsonMatch) {
          try {
            // Extract the JSON part from the response
            const jsonStr = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
            mappings = JSON.parse(jsonStr);
            
            // Validate that the mappings match our expected format
            const isValid = Object.entries(mappings).every(([key, value]) => 
              columns.includes(key) && (value === null || expectedColumns.some(ec => ec.id === value))
            );
            
            if (!isValid) {
              throw new Error("Generated mappings don't match expected format");
            }
            
            return { success: true, mappings };
          } catch (e) {
            console.error("Failed to parse JSON from API response", e);
            lastError = e;
            // Continue to retry
          }
        } else {
          lastError = new Error("Couldn't extract mapping data from the AI response");
          // Continue to retry
        }
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        lastError = err;
        // Continue to retry unless we've exhausted all attempts
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error("Failed to analyze with Gemini after multiple attempts");
    
  } catch (err: any) {
    console.error("API error:", err);
    return { 
      success: false, 
      mappings: {}, 
      error: err.message || "Failed to analyze with Gemini. Please try again." 
    };
  }
};

export default analyzeColumnsWithGemini;
