const { z } = require('zod');

/**
 * 🎯 SCHÉMAS DE VALIDATION PROFESSIONNELS AVEC ZOD
 * Remplace toutes les validations manuelles par des schémas robustes
 */

// 👤 AUTHENTIFICATION
const registerSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("Format d'email invalide")
    .max(255, "Email trop long (max 255 caractères)"),
  
  password: z
    .string({ required_error: "Le mot de passe est obligatoire" })
    .min(8, "Mot de passe trop court (min 8 caractères)")
    .max(128, "Mot de passe trop long (max 128 caractères)")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
  
  firstName: z
    .string({ required_error: "Le prénom est obligatoire" })
    .min(1, "Le prénom ne peut pas être vide")
    .max(100, "Prénom trop long (max 100 caractères)")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom contient des caractères invalides"),
  
  lastName: z
    .string({ required_error: "Le nom est obligatoire" })
    .min(1, "Le nom ne peut pas être vide")
    .max(100, "Nom trop long (max 100 caractères)")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),
  
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, "Format de téléphone français invalide")
    .optional()
    .or(z.literal(''))
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .email("Format d'email invalide"),
  
  password: z
    .string({ required_error: "Le mot de passe est obligatoire" })
    .min(1, "Le mot de passe ne peut pas être vide")
});

// 🏠 PROPRIÉTÉS
const createPropertySchema = z.object({
  // Support des deux alias: "title" (préféré) ou "name" (legacy/tests)
  title: z
    .string({ required_error: "Le titre de la propriété est obligatoire" })
    .min(1, "Le titre ne peut pas être vide")
    .max(200, "Titre trop long (max 200 caractères)")
    .trim()
    .optional(),
  name: z
    .string()
    .min(1, "Le nom ne peut pas être vide")
    .max(200, "Nom trop long (max 200 caractères)")
    .trim()
    .optional(),
  
  address: z
    .string({ required_error: "L'adresse est obligatoire" })
    .min(5, "Adresse trop courte (min 5 caractères)")
    .max(500, "Adresse trop longue (max 500 caractères)")
    .trim(),
  
  description: z
    .string()
    .max(1000, "Description trop longue (max 1000 caractères)")
    .trim()
    .optional()
    .or(z.literal(''))
}).refine((data) => !!(data.title || data.name), {
  message: "Le titre (ou nom) de la propriété est obligatoire",
  path: ["title"]
});

const updatePropertySchema = createPropertySchema.partial(); // Tous les champs optionnels pour update

// 🔐 ACCÈS
const createAccessSchema = z.object({
  propertyId: z
    .string({ required_error: "L'ID de propriété est obligatoire" })
    .cuid("Format d'ID de propriété invalide"),
  
  userId: z
    .string({ required_error: "L'ID utilisateur est obligatoire" })
    .cuid("Format d'ID utilisateur invalide"),
  
  startDate: z
    .string({ required_error: "La date de début est obligatoire" })
    .datetime("Format de date invalide (ISO 8601 attendu)")
    .transform((str) => new Date(str)),
  
  endDate: z
    .string({ required_error: "La date de fin est obligatoire" })
    .datetime("Format de date invalide (ISO 8601 attendu)")
    .transform((str) => new Date(str)),
  
  accessType: z
    .enum(['TEMPORARY', 'PERMANENT'], {
      required_error: "Le type d'accès est obligatoire",
      invalid_type_error: "Type d'accès invalide (TEMPORARY ou PERMANENT)"
    }),
  
  description: z
    .string()
    .max(500, "Description trop longue (max 500 caractères)")
    .trim()
    .optional()
    .or(z.literal(''))
}).refine((data) => data.endDate > data.startDate, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
}).refine((data) => {
  // Vérifier que la durée n'est pas excessive (max 1 an pour TEMPORARY)
  if (data.accessType === 'TEMPORARY') {
    const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes
    return (data.endDate.getTime() - data.startDate.getTime()) <= maxDuration;
  }
  return true;
}, {
  message: "Les accès temporaires ne peuvent pas dépasser 1 an",
  path: ["endDate"]
});

// 🔍 VALIDATION DE CODES
const validateCodeSchema = z.object({
  code: z
    .string({ required_error: "Le code d'accès est obligatoire" })
    .regex(/^\d{6,8}$/, "Le code doit contenir entre 6 et 8 chiffres"),
  
  propertyId: z
    .string({ required_error: "L'ID de propriété est obligatoire" })
    .cuid("Format d'ID de propriété invalide")
});

// 📊 PAGINATION CURSEUR (cursor-based)
const cursorPaginationSchema = z.object({
  cursor: z
    .string()
    .cuid("Format de curseur invalide")
    .optional(),

  limit: z
    .string()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "La limite doit être entre 1 et 100")
});

// Spécifique lock events: pagination + filtre type
const lockEventsQuerySchema = cursorPaginationSchema.extend({
  type: z.string().optional()
});

// 🆔 PARAMÈTRES COMMUNS
const cuidParamSchema = z.object({
  id: z
    .string()
    .cuid("Format d'ID invalide")
});

const accessIdParamSchema = z.object({
  accessId: z
    .string()
    .cuid("Format d'ID d'accès invalide")
});

const propertyIdParamSchema = z.object({
  propertyId: z
    .string()
    .cuid("Format d'ID de propriété invalide")
});

/**
 * 🛡️ MIDDLEWARE DE VALIDATION
 * Fonction helper pour valider automatiquement les requêtes
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = source === 'body' ? req.body : 
                   source === 'params' ? req.params : 
                   source === 'query' ? req.query : req[source];
      
      const validatedData = schema.parse(data);
      
      // Remplacer les données originales par les données validées/transformées
      if (source === 'body') req.body = validatedData;
      else if (source === 'params') req.params = validatedData;
      else if (source === 'query') req.query = validatedData;
      
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errorMessage = error.errors?.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') || 'Erreur de validation';
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.errors || [],
          details: errorMessage
        });
      }
      next(error);
    }
  };
};

module.exports = {
  // Schémas
  registerSchema,
  loginSchema,
  createPropertySchema,
  updatePropertySchema,
  createAccessSchema,
  validateCodeSchema,
  cursorPaginationSchema,
  lockEventsQuerySchema,
  cuidParamSchema,
  accessIdParamSchema,
  propertyIdParamSchema,
  
  // Middleware
  validateRequest
}; 