import { geminiData } from "../utils/gemini.js";

export const verifyImageStatus = async (req, res) => {
    const { imageUrl } = req.body;
    
      if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'Image URL is required' });
      }
    
      try {
        // Call the verification function (assuming it's defined in utils/verify_image_gemini.js)
        const prompt = `Verify the authenticity of the image at the following URL: ${imageUrl}. Provide a detailed analysis of its content, context, and any potential signs of manipulation or authenticity in less than four words.`;
        const temperature = 0.5; // Adjust temperature for response variability

        const verificationResult = await geminiData(prompt, temperature);
        console.log('Image verification result:', verificationResult);
        res.json({
          success: true,
          data: verificationResult
        });
      } catch (error) {
        console.error('Image verification error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to verify image'
        });
      }
}