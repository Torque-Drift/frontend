export { ApiClient } from "./base/ApiClient";
export {
  queryClient,
  queryKeys,
  invalidateQueries,
  removeQueries,
} from "./cache/QueryClient";

export { PurchaseService } from "./purchase/purchaseService";

import { ApiClient } from "./base/ApiClient";
import { PurchaseService } from "./purchase/purchaseService";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
export const apiClient = new ApiClient(API_BASE_URL);
export const purchaseService = new PurchaseService();

