import { BaseService } from "./BaseService";
import { Critter } from "@/models/types";
import { pb } from "./pocketbase";

export class CritterService extends BaseService<Critter> {
  private static instance: CritterService;

  private constructor() {
    super("critters", {
      defaultSort: "-created",
      userSpecific: true, // Enable user-specific filtering
    });
  }

  public static getInstance(): CritterService {
    if (!CritterService.instance) {
      CritterService.instance = new CritterService();
    }
    return CritterService.instance;
  }

  async create(data: FormData) {
    if (!pb.authStore.record?.id) {
      throw new Error("User must be authenticated to create a critter");
    }

    // Add user_id to the FormData
    data.append("user_id", pb.authStore.record.id);

    try {
      const record = await pb.collection(this.collectionName).create(data);
      return record;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: FormData) {
    try {
      const record = await pb.collection(this.collectionName).update(id, data);
      return record;
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }
}

export const critterService = CritterService.getInstance();
