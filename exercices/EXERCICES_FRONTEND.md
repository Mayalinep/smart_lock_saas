# 🎯 EXERCICES PRATIQUES - FONDATION FRONTEND

## 🎓 OBJECTIF : DEVENIR AUTONOME SUR LE FRONTEND

### 📋 EXERCICE 1 : SETUP PROJET REACT

**Objectif** : Créer ton premier projet React moderne avec Vite

**Instructions** :
1. Crée un nouveau projet React avec TypeScript
2. Configure Tailwind CSS
3. Crée un composant `Button` réutilisable
4. Teste que tout fonctionne

**Code à implémenter** :
```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ variant = 'primary', children, onClick }: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

**Test à réussir** :
```typescript
// src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('applies primary variant by default', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });
});
```

---

### 📋 EXERCICE 2 : AUTHENTIFICATION

**Objectif** : Créer un système d'authentification complet

**Instructions** :
1. Crée un hook `useAuth`
2. Implémente la connexion/déconnexion
3. Crée un composant `ProtectedRoute`
4. Gère les tokens JWT

**Code à implémenter** :
```typescript
// src/hooks/auth/useAuth.ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Stocker le token
      localStorage.setItem('token', token);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return { success: true };
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return { ...state, login, logout };
};
```

**Test à réussir** :
```typescript
// src/hooks/auth/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const response = await result.current.login('test@example.com', 'password');
      expect(response.success).toBe(true);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

### 📋 EXERCICE 3 : GESTION D'ÉTAT AVEC REACT QUERY

**Objectif** : Maîtriser React Query pour la gestion des données

**Instructions** :
1. Configure React Query
2. Crée des hooks pour les accès
3. Implémente la pagination
4. Gère les erreurs et le loading

**Code à implémenter** :
```typescript
// src/hooks/api/useAccesses.ts
export const useAccesses = (propertyId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['accesses', propertyId],
    queryFn: async () => {
      const response = await api.get(`/access/property/${propertyId}`);
      return response.data;
    },
    enabled: Boolean(propertyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

export const useCreateAccess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAccessRequest) => {
      const response = await api.post('/access', data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalider le cache des accès pour cette propriété
      queryClient.invalidateQueries({
        queryKey: ['accesses', variables.propertyId]
      });
      
      // Ajouter le nouvel accès au cache
      queryClient.setQueryData(
        ['accesses', variables.propertyId],
        (oldData: any) => {
          if (!oldData) return { items: [data], nextCursor: null, hasMore: false };
          return {
            ...oldData,
            items: [data, ...oldData.items]
          };
        }
      );
    },
    onError: (error) => {
      console.error('Erreur lors de la création d\'accès:', error);
    }
  });
};
```

**Test à réussir** :
```typescript
// src/hooks/api/useAccesses.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccesses } from './useAccesses';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAccesses', () => {
  it('should fetch accesses for a property', async () => {
    const { result } = renderHook(() => useAccesses('property-123'), {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

---

### 📋 EXERCICE 4 : FORMULAIRES AVANCÉS

**Objectif** : Créer des formulaires robustes avec validation

**Instructions** :
1. Utilise React Hook Form
2. Configure Zod pour la validation
3. Crée un formulaire de création d'accès
4. Gère les erreurs de validation

**Code à implémenter** :
```typescript
// src/lib/validations.ts
import { z } from 'zod';

export const createAccessSchema = z.object({
  propertyId: z.string().min(1, 'Propriété requise'),
  userId: z.string().min(1, 'Utilisateur requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  accessType: z.enum(['TEMPORARY', 'PERMANENT'], {
    required_error: 'Type d\'accès requis'
  }),
  description: z.string().optional()
});

export type CreateAccessFormData = z.infer<typeof createAccessSchema>;
```

```typescript
// src/components/forms/AccessForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccessSchema, type CreateAccessFormData } from '../../lib/validations';

export const AccessForm = ({ onSubmit }: { onSubmit: (data: CreateAccessFormData) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateAccessFormData>({
    resolver: zodResolver(createAccessSchema)
  });

  const onSubmitForm = async (data: CreateAccessFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
          Propriété
        </label>
        <select
          id="propertyId"
          {...register('propertyId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Sélectionner une propriété</option>
          {/* Options des propriétés */}
        </select>
        {errors.propertyId && (
          <p className="mt-1 text-sm text-red-600">{errors.propertyId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="accessType" className="block text-sm font-medium text-gray-700">
          Type d'accès
        </label>
        <select
          id="accessType"
          {...register('accessType')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Sélectionner un type</option>
          <option value="TEMPORARY">Temporaire</option>
          <option value="PERMANENT">Permanent</option>
        </select>
        {errors.accessType && (
          <p className="mt-1 text-sm text-red-600">{errors.accessType.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Date de début
          </label>
          <input
            type="datetime-local"
            id="startDate"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Date de fin
          </label>
          <input
            type="datetime-local"
            id="endDate"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optionnel)
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Description de l'accès..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Création...' : 'Créer l\'accès'}
      </button>
    </form>
  );
};
```

**Test à réussir** :
```typescript
// src/components/forms/AccessForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessForm } from './AccessForm';

describe('AccessForm', () => {
  it('should validate required fields', async () => {
    const mockOnSubmit = jest.fn();
    render(<AccessForm onSubmit={mockOnSubmit} />);
    
    // Essayer de soumettre sans remplir les champs
    fireEvent.click(screen.getByText('Créer l\'accès'));
    
    await waitFor(() => {
      expect(screen.getByText('Propriété requise')).toBeInTheDocument();
      expect(screen.getByText('Type d\'accès requis')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(<AccessForm onSubmit={mockOnSubmit} />);
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Propriété'), {
      target: { value: 'property-123' }
    });
    fireEvent.change(screen.getByLabelText('Type d\'accès'), {
      target: { value: 'TEMPORARY' }
    });
    fireEvent.change(screen.getByLabelText('Date de début'), {
      target: { value: '2024-01-01T10:00' }
    });
    fireEvent.change(screen.getByLabelText('Date de fin'), {
      target: { value: '2024-01-02T10:00' }
    });
    
    fireEvent.click(screen.getByText('Créer l\'accès'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        propertyId: 'property-123',
        accessType: 'TEMPORARY',
        startDate: '2024-01-01T10:00',
        endDate: '2024-01-02T10:00',
        description: ''
      });
    });
  });
});
```

---

### 📋 EXERCICE 5 : COMPOSANTS SPÉCIALISÉS

**Objectif** : Créer des composants métier pour Smart Lock

**Instructions** :
1. Crée un composant `AccessCard`
2. Crée un composant `LockStatusIndicator`
3. Crée un composant `PropertyCard`
4. Implémente les interactions utilisateur

**Code à implémenter** :
```typescript
// src/components/features/AccessCard.tsx
interface Access {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  accessType: 'TEMPORARY' | 'PERMANENT';
  description?: string;
  isActive: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AccessCardProps {
  access: Access;
  onRevoke?: (accessId: string) => void;
  onEdit?: (access: Access) => void;
}

export const AccessCard = ({ access, onRevoke, onEdit }: AccessCardProps) => {
  const isExpired = new Date(access.endDate) < new Date();
  const isActive = access.isActive && !isExpired;
  
  const getStatusColor = () => {
    if (!access.isActive) return 'bg-red-100 text-red-800';
    if (isExpired) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getStatusText = () => {
    if (!access.isActive) return 'Révoqué';
    if (isExpired) return 'Expiré';
    return 'Actif';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {access.user.firstName} {access.user.lastName}
          </h3>
          <p className="text-sm text-gray-600">{access.user.email}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Code d'accès:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {access.code}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="capitalize">
            {access.accessType === 'TEMPORARY' ? 'Temporaire' : 'Permanent'}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Début:</span>
          <span>{new Date(access.startDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fin:</span>
          <span>{new Date(access.endDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      {access.description && (
        <p className="text-sm text-gray-600 mb-4">{access.description}</p>
      )}
      
      <div className="flex space-x-2">
        {onEdit && (
          <button
            onClick={() => onEdit(access)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>
        )}
        
        {onRevoke && access.isActive && (
          <button
            onClick={() => onRevoke(access.id)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Révoquer
          </button>
        )}
      </div>
    </div>
  );
};
```

**Test à réussir** :
```typescript
// src/components/features/AccessCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessCard } from './AccessCard';

const mockAccess = {
  id: 'access-123',
  code: '123456',
  startDate: '2024-01-01T10:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  accessType: 'TEMPORARY' as const,
  description: 'Accès temporaire pour maintenance',
  isActive: true,
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
};

describe('AccessCard', () => {
  it('should display access information correctly', () => {
    render(<AccessCard access={mockAccess} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('Temporaire')).toBeInTheDocument();
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });
  
  it('should call onRevoke when revoke button is clicked', () => {
    const mockOnRevoke = jest.fn();
    render(<AccessCard access={mockAccess} onRevoke={mockOnRevoke} />);
    
    fireEvent.click(screen.getByText('Révoquer'));
    expect(mockOnRevoke).toHaveBeenCalledWith('access-123');
  });
  
  it('should show expired status for expired access', () => {
    const expiredAccess = {
      ...mockAccess,
      endDate: '2020-01-01T00:00:00Z'
    };
    
    render(<AccessCard access={expiredAccess} />);
    expect(screen.getByText('Expiré')).toBeInTheDocument();
  });
});
```

---

## 🎯 EXERCICES BONUS POUR DEVENIR EXPERT

### 📋 EXERCICE BONUS 1 : PERFORMANCE ET OPTIMISATION

**Objectif** : Optimiser les performances de l'application

**Tâches** :
1. Implémente le lazy loading des routes
2. Optimise les re-renders avec `React.memo`
3. Utilise `useMemo` et `useCallback` stratégiquement
4. Implémente la virtualisation pour les longues listes

### 📋 EXERCICE BONUS 2 : TESTS E2E AVEC CYPRESS

**Objectif** : Créer des tests end-to-end complets

**Tâches** :
1. Configure Cypress
2. Crée des tests pour le workflow complet
3. Teste les cas d'erreur
4. Implémente les tests de performance

### 📋 EXERCICE BONUS 3 : PWA ET OFFLINE

**Objectif** : Transformer l'app en PWA

**Tâches** :
1. Configure le Service Worker
2. Implémente le cache stratégique
3. Ajoute les notifications push
4. Teste le mode offline

---

## 🏆 CRITÈRES DE RÉUSSITE

### **NIVEAU DÉBUTANT** ✅
- [ ] Projet React fonctionnel avec Vite
- [ ] Authentification de base
- [ ] Composants UI simples
- [ ] Tests unitaires de base

### **NIVEAU INTERMÉDIAIRE** ⚡
- [ ] Gestion d'état avec React Query
- [ ] Formulaires avancés avec validation
- [ ] Composants métier spécialisés
- [ ] Tests d'intégration

### **NIVEAU EXPERT** 🚀
- [ ] Optimisations de performance
- [ ] Tests E2E complets
- [ ] PWA avec mode offline
- [ ] Architecture scalable

---

## 🎓 CONSEILS PÉDAGOGIQUES

### **POUR CHAQUE EXERCICE :**
1. **Lis d'abord** la théorie dans la TODO
2. **Implémente** le code étape par étape
3. **Teste** immédiatement après chaque fonctionnalité
4. **Documente** tes apprentissages dans un fichier .md
5. **Demande de l'aide** si tu bloques plus de 30 minutes

### **BONNES PRATIQUES :**
- ✅ Commence simple, complexifie progressivement
- ✅ Teste souvent, déploie tôt
- ✅ Documente tes décisions architecturales
- ✅ Utilise TypeScript strictement
- ✅ Suis les conventions de nommage

**TU VAS DEVENIR UNE EXPERTE FRONTEND !** 💪🎯 