
export function paginate(page: number = 1, size: number = 10): { limit: number; skip: number } {

    const validPage = Math.max(page, 1);
    const validSize = Math.max(size, 1);
  
    const skip = (validPage - 1) * validSize;
    return { limit: validSize, skip };
  }
  