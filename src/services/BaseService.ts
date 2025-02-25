import { BaseModel } from "@/models/types";
import { pb } from "./pocketbase";
import { ClientResponseError } from "pocketbase";

export class BaseService<T extends BaseModel> {
  protected constructor(
    protected readonly collectionName: string,
    protected readonly options?: {
      defaultSort?: string;
      filters?: string;
      userSpecific?: boolean;
    }
  ) {}

  protected getUserFilter(): string {
    if (!this.options?.userSpecific) return "";
    if (!pb.authStore.record?.id) {
      throw new Error("User must be authenticated to access this resource");
    }
    return `user_id = "${pb.authStore.record.id}"`;
  }

  async getList(page: number, perPage: number) {
    try {
      const userFilter = this.getUserFilter();
      const filter = userFilter
        ? `${userFilter}${
            this.options?.filters ? ` && ${this.options.filters}` : ""
          }`
        : this.options?.filters || "";

      const resultList = await pb
        .collection(this.collectionName)
        .getList(page, perPage, {
          sort: this.options?.defaultSort || "-created",
          filter,
        });

      return {
        items: resultList.items as unknown as T[],
        totalPages: Math.ceil(resultList.totalItems / perPage),
      };
    } catch (error) {
      // Check for auto-cancellation
      if (error instanceof ClientResponseError && error.isAbort) {
        // Fail silently for auto-cancelled requests
        return {
          items: [] as T[],
          totalPages: 0,
        };
      }
      console.error(`Error fetching ${this.collectionName}:`, error);
      throw error;
    }
  }

  async create(data: Partial<T>) {
    try {
      const record = await pb.collection(this.collectionName).create(data);
      return record as unknown as T;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>) {
    try {
      const record = await pb.collection(this.collectionName).update(id, data);
      return record as unknown as T;
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await pb.collection(this.collectionName).delete(id);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }
}
