import { geminiData } from "../utils/gemini.js";

export async function getLocationfromDescription(description) {
  try {

    const prompt = `Extract the location from the following description: ${description}`;
    const temperature = 0.1; // Adjust temperature for response variability

    const response = await geminiData(prompt, temperature);
    console.log("Extracted location:", response);
    return response.trim(); // Return the location as a string
  } catch (error) {
    throw new Error(error)
  }
}
