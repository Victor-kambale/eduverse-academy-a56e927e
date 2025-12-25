import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

// Validation schemas for each step
export const step1Schema = z.object({
  organization_name: z.string().min(3, 'Organization name must be at least 3 characters').max(200, 'Organization name is too long'),
  organization_type: z.string().min(1, 'Please select an organization type'),
  country: z.string().min(2, 'Country is required'),
  organization_acronym: z.string().max(20, 'Acronym is too long').optional(),
  year_established: z.string().optional().refine((val) => {
    if (!val) return true;
    const year = parseInt(val);
    return year >= 1800 && year <= new Date().getFullYear();
  }, 'Please enter a valid year'),
  registration_number: z.string().max(50, 'Registration number is too long').optional(),
  state_province: z.string().max(100, 'State/Province is too long').optional(),
  city: z.string().max(100, 'City is too long').optional(),
  postal_code: z.string().max(20, 'Postal code is too long').optional(),
  street_address: z.string().max(500, 'Address is too long').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().max(2000, 'Description is too long').optional(),
  mission_statement: z.string().max(1000, 'Mission statement is too long').optional(),
});

export const step2Schema = z.object({
  primary_email: z.string().email('Please enter a valid email address'),
  secondary_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  primary_phone: z.string().min(8, 'Phone number must be at least 8 digits').max(20, 'Phone number is too long'),
  secondary_phone: z.string().max(20, 'Phone number is too long').optional(),
  fax_number: z.string().max(20, 'Fax number is too long').optional(),
  contact_person_name: z.string().min(2, 'Contact person name is required').max(100, 'Name is too long'),
  contact_person_title: z.string().max(100, 'Title is too long').optional(),
  contact_person_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contact_person_phone: z.string().max(20, 'Phone number is too long').optional(),
});

export const step3Schema = z.object({
  legal_entity_name: z.string().min(2, 'Legal entity name is required').max(200, 'Name is too long'),
  legal_entity_type: z.string().max(100, 'Type is too long').optional(),
  tax_id: z.string().min(5, 'Tax ID is required').max(50, 'Tax ID is too long'),
  vat_number: z.string().max(50, 'VAT number is too long').optional(),
  business_license_number: z.string().max(50, 'License number is too long').optional(),
  incorporation_date: z.string().optional(),
  jurisdiction: z.string().max(100, 'Jurisdiction is too long').optional(),
});

export const step5Schema = z.object({
  accreditation_body: z.string().max(200, 'Name is too long').optional(),
  accreditation_number: z.string().max(50, 'Number is too long').optional(),
  accreditation_date: z.string().optional(),
  accreditation_expiry: z.string().optional(),
  student_enrollment: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, 'Please enter a valid number'),
  faculty_count: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, 'Please enter a valid number'),
  campus_count: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, 'Please enter a valid number'),
  programs_offered: z.string().max(500, 'Text is too long').optional(),
});

export const step6Schema = z.object({
  bank_country: z.string().max(100, 'Country is too long').optional(),
  bank_name: z.string().min(2, 'Bank name is required').max(200, 'Bank name is too long'),
  bank_branch: z.string().max(200, 'Branch name is too long').optional(),
  account_holder_name: z.string().min(2, 'Account holder name is required').max(200, 'Name is too long'),
  account_number: z.string().min(5, 'Account number is required').max(50, 'Account number is too long'),
  routing_number: z.string().max(50, 'Routing number is too long').optional(),
  swift_code: z.string().max(20, 'SWIFT code is too long').optional(),
  iban: z.string().max(50, 'IBAN is too long').optional(),
});

export type ValidationErrors = Record<string, string>;

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: string, schema: z.ZodSchema) => {
    try {
      schema.parse({ [field]: value });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find((e) => e.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        }
      }
      return false;
    }
  }, []);

  const validateStep = useCallback((step: number, formData: Record<string, unknown>) => {
    let schema: z.ZodSchema;
    
    switch (step) {
      case 1:
        schema = step1Schema;
        break;
      case 2:
        schema = step2Schema;
        break;
      case 3:
        schema = step3Schema;
        break;
      case 5:
        schema = step5Schema;
        break;
      case 6:
        schema = step6Schema;
        break;
      default:
        return { isValid: true, errors: {} };
    }

    try {
      schema.parse(formData);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const stepErrors: ValidationErrors = {};
        error.errors.forEach((e) => {
          if (e.path[0]) {
            stepErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        return { isValid: false, errors: stepErrors };
      }
      return { isValid: true, errors: {} };
    }
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback((field: string) => {
    return touched[field] ? errors[field] : undefined;
  }, [errors, touched]);

  return {
    errors,
    touched,
    validateField,
    validateStep,
    markTouched,
    clearErrors,
    getFieldError,
    setErrors,
  };
}
