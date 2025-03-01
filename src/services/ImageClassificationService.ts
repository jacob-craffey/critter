import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectLabelsCommandInput,
} from "@aws-sdk/client-rekognition";

class ImageClassificationService {
  private client: RekognitionClient;
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB (AWS Rekognition limit)
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

  // Terms that indicate non-animal entities
  private readonly nonAnimalTerms = new Set([
    "plant",
    "tree",
    "flower",
    "vegetation",
    "fungus",
    "building",
    "architecture",
    "furniture",
    "vehicle",
    "food",
    "fruit",
    "vegetable",
    "landscape",
    "scenery",
    "human",
    "person",
    "people",
    "man",
    "woman",
    "child",
    "object",
    "device",
    "tool",
    "machine",
    "electronics",
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

      // Check if image exceeds the size limit
      if (arrayBuffer.byteLength > this.MAX_IMAGE_SIZE) {
        const sizeMB = (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2);
        throw new Error(
          `Image size (${sizeMB}MB) exceeds the maximum allowed size of 5MB for species identification.`
        );
      }

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

          // Exclude non-animal terms
          if (this.nonAnimalTerms.has(name)) {
            return false;
          }

          // Check if any parent or category indicates this is not an animal
          if (
            parents.some((p) => this.nonAnimalTerms.has(p)) ||
            label.categories.some(
              (c) =>
                c.includes("Plant") ||
                c.includes("Food") ||
                c.includes("Furniture") ||
                c.includes("Building")
            )
          ) {
            return false;
          }

          // Ensure it's an animal species
          const isAnimalSpecies =
            // Has animal-related parents
            parents.some(
              (p) =>
                p.includes("animal") ||
                p.includes("mammal") ||
                p.includes("bird") ||
                p.includes("reptile") ||
                p.includes("amphibian") ||
                p.includes("fish") ||
                p.includes("species") ||
                p.includes("genus") ||
                p.includes("family")
            ) ||
            // Is in animal-related categories
            label.categories.some(
              (c) =>
                c.includes("Animal") ||
                c.includes("Wildlife") ||
                c.includes("Pet")
            ) ||
            // Has specific naming patterns for animal species (e.g., "Red Fox", "Eastern Bluebird")
            /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(label.name);

          return isAnimalSpecies && label.confidence > 80;
        })
        .sort((a, b) => b.confidence - a.confidence);

      if (speciesCandidates.length > 0) {
        const bestMatch = speciesCandidates[0];
        console.log(
          "Detected animal species:",
          bestMatch.name,
          "with confidence:",
          bestMatch.confidence
        );
        return bestMatch.name;
      }

      return null;
    } catch (error) {
      console.error("Error classifying image with Rekognition:", error);
      // Re-throw the error if it's our custom size error
      if (
        error instanceof Error &&
        error.message.includes("exceeds the maximum allowed size")
      ) {
        throw error;
      }
      return null;
    }
  }
}

export const imageClassificationService = new ImageClassificationService();
