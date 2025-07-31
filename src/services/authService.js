const prisma = require('../config/database');
const { hashPassword, comparePassword, validatePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

/**
 * Service d'authentification
 */
class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données utilisateur
   * @returns {Object} Utilisateur créé sans mot de passe
   */
  static async register(userData) {
    const { email, password, firstName, lastName, phone } = userData;

    // TODO: Valider les données d'entrée
    // TODO: Vérifier que l'email n'existe pas déjà
    // TODO: Valider la force du mot de passe
    // TODO: Hasher le mot de passe
    // TODO: Créer l'utilisateur en base
    // TODO: Retourner l'utilisateur sans le mot de passe

    throw new Error('Méthode register à implémenter');
  }

  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email utilisateur
   * @param {string} password - Mot de passe
   * @returns {Object} Utilisateur et token
   */
  static async login(email, password) {
    // TODO: Trouver l'utilisateur par email
    // TODO: Vérifier que l'utilisateur existe et est actif
    // TODO: Comparer le mot de passe
    // TODO: Générer un token JWT
    // TODO: Retourner l'utilisateur et le token

    throw new Error('Méthode login à implémenter');
  }

  /**
   * Récupération du profil utilisateur
   * @param {string} userId - ID utilisateur
   * @returns {Object} Profil utilisateur
   */
  static async getProfile(userId) {
    // TODO: Récupérer l'utilisateur par ID
    // TODO: Retourner le profil sans le mot de passe

    throw new Error('Méthode getProfile à implémenter');
  }

  /**
   * Mise à jour du profil utilisateur
   * @param {string} userId - ID utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Profil mis à jour
   */
  static async updateProfile(userId, updateData) {
    // TODO: Valider les données
    // TODO: Si changement de mot de passe, valider et hasher
    // TODO: Mettre à jour l'utilisateur
    // TODO: Retourner le profil mis à jour

    throw new Error('Méthode updateProfile à implémenter');
  }

  /**
   * Changement de mot de passe
   * @param {string} userId - ID utilisateur
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   */
  static async changePassword(userId, currentPassword, newPassword) {
    // TODO: Récupérer l'utilisateur
    // TODO: Vérifier le mot de passe actuel
    // TODO: Valider le nouveau mot de passe
    // TODO: Hasher et sauvegarder le nouveau mot de passe

    throw new Error('Méthode changePassword à implémenter');
  }
}

/**
 * Fonction d'inscription d'un utilisateur
 * @param {Object} userData - Données utilisateur  
 * @returns {Object} Utilisateur créé
 */
async function registerUser({ email, password, firstName, lastName, phone }) {
  // 1. Vérifier si un utilisateur existe déjà avec cet email
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé');
    error.status = 409;
    throw error;
  }

  // 2. Hasher le mot de passe avec bcrypt (12 rounds)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Créer un utilisateur avec Prisma
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null
    }
  });

  // 4. Retirer le mot de passe de l'utilisateur pour éviter de l'exposer
  const { password: _, ...userWithoutPassword } = newUser;

  // 5. Retourner l'utilisateur créé (sans mot de passe)
  return userWithoutPassword;
}

/**
 * Fonction de connexion d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Object} Utilisateur et token
 */
async function loginUser(email, password) {
  // 1. Chercher l'utilisateur avec l'email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // 2. Si aucun utilisateur trouvé
  if (!user) {
    const error = new Error('Utilisateur non trouvé');
    error.status = 401;
    throw error;
  }

  // 3. Comparer le mot de passe avec bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // 4. Si le mot de passe est incorrect
  if (!isPasswordValid) {
    const error = new Error('Mot de passe incorrect');
    error.status = 401;
    throw error;
  }

  // 5. Générer un token JWT
  const token = generateToken({ userId: user.id });

  // 6. Retirer le mot de passe de l'utilisateur pour éviter de l'exposer
  const { password: _, ...userWithoutPassword } = user;

  // 7. Retourner l'utilisateur (sans mot de passe) et le token
  return { user: userWithoutPassword, token };
}

module.exports = { AuthService, registerUser, loginUser }; 