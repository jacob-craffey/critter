import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectLabelsCommandInput,
} from "@aws-sdk/client-rekognition";

class ImageClassificationService {
  private client: RekognitionClient;
  private readonly genericTerms = new Set([
    "animal",
    "wildlife",
    "mammal",
    "bird",
    "reptile",
    "amphibian",
    "pet",
    "creature",
    "fauna",
    "vertebrate",
    "invertebrate",
    "carnivore",
    "herbivore",
    "predator",
    "prey",
  ]);

  constructor() {
    this.client = new RekognitionClient({
      region: import.meta.env.VITE_AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async classifyImage(imageFile: File): Promise<string | null> {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageBytes = new Uint8Array(arrayBuffer);

      const params: DetectLabelsCommandInput = {
        Image: {
          Bytes: imageBytes,
        },
        MaxLabels: 50, // Increased to get more potential species matches
        MinConfidence: 70, // Lowered to catch more specific taxonomic labels
        Features: ["GENERAL_LABELS"], // Use general labels for detection
      };

      const command = new DetectLabelsCommand(params);
      const response = await this.client.send(command);

      if (!response.Labels?.length) {
        return null;
      }

      // Extract hierarchical labels and their parents
      const labelHierarchy = response.Labels.map((label) => ({
        name: label.Name || "",
        confidence: label.Confidence || 0,
        parents: label.Parents?.map((p) => p.Name || "") || [],
        categories: label.Categories?.map((c) => c.Name || "") || [],
      }));

      // Filter and sort potential species
      const speciesCandidates = labelHierarchy
        .filter((label) => {
          const name = label.name.toLowerCase();
          const parents = label.parents.map((p) => p.toLowerCase());

          // Exclude generic terms
          if (this.genericTerms.has(name)) {
            return false;
          }

          // Check if it's likely a species
          const isLikelySpecies =
            // Has specific taxonomic parents
            parents.some(
              (p) =>
                p.includes("species") ||
                p.includes("genus") ||
                p.includes("family")
            ) ||
            // Is in specific categories
            label.categories.some(
              (c) =>
                c.includes("Animal") ||
                c.includes("Species") ||
                c.includes("Wildlife")
            ) ||
            // Has specific naming patterns (e.g., "Red Fox", "Eastern Bluebird")
            /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(label.name) ||
            // Common species naming patterns
            name.includes("species") ||
            (name.split(" ").length >= 2 &&
              !this.genericTerms.has(name.split(" ")[0]));

          return isLikelySpecies && label.confidence > 80;
        })
        .sort((a, b) => b.confidence - a.confidence);

      if (speciesCandidates.length > 0) {
        const bestMatch = speciesCandidates[0];

        return bestMatch.name;
      }

      return null;
    } catch (error) {
      console.error("Error classifying image with Rekognition:", error);
      return null;
    }
  }
}

export const imageClassificationService = new ImageClassificationService();
