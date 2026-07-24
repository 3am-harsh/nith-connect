'use server';

import { 
  getFirestoreMarketplaceItems, 
  createFirestoreMarketplaceItem, 
  updateMarketplaceItemStatus,
  FirestoreMarketplaceItem 
} from '@/lib/firestore';

export async function getMarketplaceItemsAction(): Promise<FirestoreMarketplaceItem[]> {
  return await getFirestoreMarketplaceItems();
}

export async function createMarketplaceItemAction(
  title: string,
  description: string,
  originalPrice: number,
  sellingPrice: number,
  contactNumber: string,
  image: string,
  userId: string,
  userName: string,
  category: string
): Promise<boolean> {
  const item: Omit<FirestoreMarketplaceItem, 'id' | 'created_at'> = {
    title,
    description,
    original_price: originalPrice,
    selling_price: sellingPrice,
    contact_number: contactNumber,
    image,
    user_id: userId,
    user_name: userName,
    category,
    status: 'active'
  };
  return await createFirestoreMarketplaceItem(item);
}

export async function updateMarketplaceItemStatusAction(id: string, status: 'active' | 'sold'): Promise<boolean> {
  return await updateMarketplaceItemStatus(id, status);
}
