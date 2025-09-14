import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { errors } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw errors.VALIDATION_ERROR(errorMessage);
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw errors.VALIDATION_ERROR(errorMessage);
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw errors.VALIDATION_ERROR(errorMessage);
    }

    req.params = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Customer validation
  customer: {
    create: Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(2).max(100).optional(),
      phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
      address: Joi.string().max(500).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      country: Joi.string().max(100).optional(),
      postalCode: Joi.string().max(20).optional(),
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
      address: Joi.string().max(500).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      country: Joi.string().max(100).optional(),
      postalCode: Joi.string().max(20).optional(),
    }),
  },

  // Order validation
  order: {
    create: Joi.object({
      customerId: Joi.string().required(),
      orderNumber: Joi.string().required(),
      totalAmount: Joi.number().positive().required(),
      status: Joi.string().valid('pending', 'completed', 'cancelled', 'refunded').required(),
      orderDate: Joi.date().optional(),
    }),
    update: Joi.object({
      status: Joi.string().valid('pending', 'completed', 'cancelled', 'refunded').optional(),
    }),
  },

  // Segment validation
  segment: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500).optional(),
      rules: Joi.object().required(),
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().max(500).optional(),
      rules: Joi.object().optional(),
    }),
  },

  // Campaign validation
  campaign: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500).optional(),
      message: Joi.string().min(10).max(1000).required(),
      segmentId: Joi.string().required(),
      scheduledAt: Joi.date().optional(),
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().max(500).optional(),
      message: Joi.string().min(10).max(1000).optional(),
      status: Joi.string().valid('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled').optional(),
    }),
  },

  // AI validation
  ai: {
    ruleParser: Joi.object({
      prompt: Joi.string().min(10).max(500).required(),
    }),
    messageSuggestion: Joi.object({
      campaignObjective: Joi.string().min(5).max(200).required(),
      audienceDescription: Joi.string().max(500).optional(),
      tone: Joi.string().valid('formal', 'casual', 'friendly', 'urgent', 'promotional').optional(),
    }),
    performanceSummary: Joi.object({
      campaignId: Joi.string().required(),
    }),
  },

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // ID validation
  id: Joi.object({
    id: Joi.string().required(),
  }),
};
