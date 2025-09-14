import { Prisma } from '@prisma/client';

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn' | 'isNull' | 'isNotNull';
  value: any;
}

export interface RuleGroup {
  operator: 'AND' | 'OR';
  conditions: (RuleCondition | RuleGroup)[];
}

export class SQLBuilder {
  static validateRule(rules: any): boolean {
    try {
      this.buildWhereClause(rules);
      return true;
    } catch {
      return false;
    }
  }

  static getFieldType(field: string): string {
    // Return field type based on field name
    const fieldTypes: Record<string, string> = {
      'email': 'string',
      'name': 'string',
      'phone': 'string',
      'city': 'string',
      'state': 'string',
      'country': 'string',
      'postalCode': 'string',
      'totalSpent': 'number',
      'totalOrders': 'number',
      'lastOrderDate': 'date',
      'createdAt': 'date',
      'updatedAt': 'date',
    };
    return fieldTypes[field] || 'string';
  }

  static getOperatorsForField(field: string): string[] {
    const fieldType = this.getFieldType(field);
    const operators: Record<string, string[]> = {
      'string': ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'in', 'notIn', 'isNull', 'isNotNull'],
      'number': ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn', 'isNull', 'isNotNull'],
      'date': ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'isNull', 'isNotNull'],
    };
    return operators[fieldType] || operators['string'] || [];
  }

  private static buildCondition(condition: RuleCondition): Prisma.CustomerWhereInput {
    const { field, operator, value } = condition;

    switch (operator) {
      case 'eq':
        return { [field]: { equals: value } };
      case 'ne':
        return { [field]: { not: { equals: value } } };
      case 'gt':
        return { [field]: { gt: value } };
      case 'gte':
        return { [field]: { gte: value } };
      case 'lt':
        return { [field]: { lt: value } };
      case 'lte':
        return { [field]: { lte: value } };
      case 'contains':
        return { [field]: { contains: value, mode: 'insensitive' } };
      case 'startsWith':
        return { [field]: { startsWith: value, mode: 'insensitive' } };
      case 'endsWith':
        return { [field]: { endsWith: value, mode: 'insensitive' } };
      case 'in':
        return { [field]: { in: Array.isArray(value) ? value : [value] } };
      case 'notIn':
        return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
      case 'isNull':
        return { [field]: { equals: null } };
      case 'isNotNull':
        return { [field]: { not: { equals: null } } };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private static buildGroup(group: RuleGroup): Prisma.CustomerWhereInput {
    const { operator, conditions } = group;
    const builtConditions = conditions.map(condition => {
      if ('field' in condition) {
        return this.buildCondition(condition as RuleCondition);
      } else {
        return this.buildGroup(condition as RuleGroup);
      }
    });

    if (operator === 'AND') {
      return { AND: builtConditions };
    } else {
      return { OR: builtConditions };
    }
  }

  static buildWhereClause(rules: RuleGroup | RuleCondition): Prisma.CustomerWhereInput {
    if ('field' in rules) {
      return this.buildCondition(rules as RuleCondition);
    } else {
      return this.buildGroup(rules as RuleGroup);
    }
  }

  static buildOrderByClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Prisma.CustomerOrderByWithRelationInput {
    if (!sortBy) {
      return { createdAt: sortOrder };
    }

    const allowedSortFields = [
      'createdAt', 'updatedAt', 'name', 'email', 'totalSpent', 'totalOrders', 'lastOrderAt'
    ];

    if (!allowedSortFields.includes(sortBy)) {
      return { createdAt: sortOrder };
    }

    return { [sortBy]: sortOrder };
  }

  static buildPaginationClause(page: number = 1, limit: number = 10): { skip: number; take: number } {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  static buildSelectClause(fields?: string[]): Prisma.CustomerSelect {
    if (!fields || fields.length === 0) {
      return {
        id: true,
        email: true,
        name: true,
        phone: true,
        totalSpent: true,
        totalOrders: true,
        lastOrderAt: true,
        createdAt: true,
        updatedAt: true,
      };
    }

    const select: Prisma.CustomerSelect = {};
    fields.forEach(field => {
      select[field as keyof Prisma.CustomerSelect] = true;
    });

    return select;
  }

  static buildIncludeClause(include?: string[]): Prisma.CustomerInclude {
    if (!include || include.length === 0) {
      return {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            orderDate: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 5,
        },
      };
    }

    const includeClause: Prisma.CustomerInclude = {};
    include.forEach(field => {
      if (field === 'orders') {
        includeClause.orders = {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            orderDate: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
        };
      }
    });

    return includeClause;
  }
}

export class SegmentRuleBuilder {
  static validateRule(rule: any): boolean {
    try {
      if (typeof rule !== 'object' || rule === null) {
        return false;
      }

      if ('field' in rule && 'operator' in rule) {
        // It's a condition
        return this.validateCondition(rule);
      } else if ('operator' in rule && 'conditions' in rule) {
        // It's a group
        return this.validateGroup(rule);
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private static validateCondition(condition: RuleCondition): boolean {
    const { field, operator, value } = condition;

    // Validate field
    const allowedFields = [
      'email', 'name', 'phone', 'city', 'state', 'country', 'postalCode',
      'totalSpent', 'totalOrders', 'lastOrderAt', 'createdAt'
    ];
    if (!allowedFields.includes(field)) {
      return false;
    }

    // Validate operator
    const allowedOperators = [
      'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith',
      'endsWith', 'in', 'notIn', 'isNull', 'isNotNull'
    ];
    if (!allowedOperators.includes(operator)) {
      return false;
    }

    // Validate value based on operator
    if (['isNull', 'isNotNull'].includes(operator)) {
      return value === null || value === undefined;
    }

    if (['in', 'notIn'].includes(operator)) {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== null && value !== undefined;
  }

  private static validateGroup(group: RuleGroup): boolean {
    const { operator, conditions } = group;

    if (!['AND', 'OR'].includes(operator)) {
      return false;
    }

    if (!Array.isArray(conditions) || conditions.length === 0) {
      return false;
    }

    return conditions.every(condition => {
      if ('field' in condition) {
        return this.validateCondition(condition as RuleCondition);
      } else {
        return this.validateGroup(condition as RuleGroup);
      }
    });
  }

  static getFieldType(field: string): 'string' | 'number' | 'date' | 'boolean' {
    const fieldTypes: Record<string, 'string' | 'number' | 'date' | 'boolean'> = {
      email: 'string',
      name: 'string',
      phone: 'string',
      city: 'string',
      state: 'string',
      country: 'string',
      postalCode: 'string',
      totalSpent: 'number',
      totalOrders: 'number',
      lastOrderAt: 'date',
      createdAt: 'date',
    };

    return fieldTypes[field] || 'string';
  }

  static getOperatorsForField(field: string): string[] {
    const fieldType = this.getFieldType(field);

    switch (fieldType) {
      case 'string':
        return ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'in', 'notIn', 'isNull', 'isNotNull'];
      case 'number':
        return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn', 'isNull', 'isNotNull'];
      case 'date':
        return ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'isNull', 'isNotNull'];
      case 'boolean':
        return ['eq', 'ne', 'isNull', 'isNotNull'];
      default:
        return ['eq', 'ne', 'isNull', 'isNotNull'];
    }
  }
}
