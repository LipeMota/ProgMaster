/**
 * Sistema de validação robusta para inputs do usuário
 */

export const validatePlayerName = (nome: string): { valid: boolean; error?: string } => {
  const trimmed = nome.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Nome não pode estar vazio' };
  }
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Nome deve ter pelo menos 3 caracteres' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: 'Nome deve ter no máximo 20 caracteres' };
  }
  
  // Permite letras, números, espaços e acentuação
  const validPattern = /^[a-zA-Z0-9À-ſ\s]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'Nome contém caracteres inválidos' };
  }
  
  // Bloqueia nomes ofensivos básicos
  const blacklist = ['admin', 'root', 'null', 'undefined', 'test'];
  if (blacklist.includes(trimmed.toLowerCase())) {
    return { valid: false, error: 'Nome não permitido' };
  }
  
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"';]/g, '') // Remove caracteres perigosos
    .substring(0, 100); // Limita tamanho
};

export const validateNumber = (value: any, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export default {
  validatePlayerName,
  sanitizeInput,
  validateNumber,
  isValidEmail,
};
