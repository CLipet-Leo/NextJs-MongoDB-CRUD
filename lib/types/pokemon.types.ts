/**
 * Types TypeScript pour la sécurité du typage
 */

// Interface pour le document MongoDB
export interface IPokemon {
  _id: string; // ID généré par MongoDB
  name: string;
  types: {
    type_1: string;
    type_2?: string; // Type secondaire optionnel
  };
  createdAt: Date;
  updatedAt: Date;
}

// Type pour la création (sans _id, dates auto)
export interface CreatePokemonInput {
  name: string;
  types: {
    type_1: string;
    type_2?: string;
  };
}

// Type pour la mise à jour (tout optionnel)
export interface UpdatePokemonInput {
  name?: string;
  types?: {
    type_1?: string;
    type_2?: string;
  };
}
