import { useLiveQuery } from '@electric-sql/pglite-react';
import { animalsCollection } from '../../lib/database';
import { Animal } from '../../types';

export const useAnimalsData = () => {
  const result = useLiveQuery(`SELECT * FROM animals WHERE is_deleted = false ORDER BY name ASC;`);
  
  // STRICT LOADING: True until the first WebAssembly result tick
  const isEngineLoading = result?.rows === undefined;
  const safeRows = (result?.rows || []) as Animal[];

  // OMNI-RETURN: Guaranteeing all expected aliases
  return { 
    data: safeRows, 
    animals: safeRows, 
    isLoading: isEngineLoading, 
    animalsLoading: isEngineLoading, // Catch-all for the ReferenceError
    error: result?.error,
    addAnimal: async (animal: Omit<Animal, 'id'>) => {
      await animalsCollection.insert({ ...animal, id: crypto.randomUUID(), isDeleted: false });
    },
    updateAnimal: async (animal: Animal) => {
      await animalsCollection.update(animal.id, animal);
    }
  };
};
