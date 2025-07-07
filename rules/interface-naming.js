/**
 * @fileoverview Enforce interface naming and property conventions
 */
"use strict";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce interface naming and property conventions",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      interfacePascalCase: "Interface name must be in PascalCase.",
      interfaceNoIPrefix: "Interface name should not have an 'I' prefix.",
      interfaceNoAllCaps: "Interface name should not use all-caps abbreviations (e.g., HTTPClientConfig).",
      interfaceNoTooGeneric: "Interface name '{{name}}' is too generic.",
      interfaceNoLowercase: "Interface name should start with an uppercase letter.",
      propertyCamelCase: "Interface property '{{name}}' must be in camelCase.",
      propertyNoSnakeCase: "Interface property '{{name}}' must not be in snake_case.",
      propertyNoUppercase: "Interface property '{{name}}' must not start with an uppercase letter.",
      propertyBooleanPrefix: "Boolean property '{{name}}' should start with 'is', 'has', or 'should'.",
      propertyPluralCollection: "Collection property '{{name}}' should use plural form.",
      propertyNoBadAbbr: "Property name '{{name}}' is too abbreviated or unclear.",
    },
  },

  create(context) {
    // 可根据实际需要扩展
    const tooGenericNames = ["Config", "Data", "Info", "Type", "Props"];
    const badAbbrs = ["mxRtAtmpt", "cfg", "usr", "dt", "lst", "itm"]; // 可扩展

    function isPascalCase(name) {
      return /^[A-Z][a-zA-Z0-9]*$/.test(name);
    }
    function isAllCapsAbbr(name) {
      return /[A-Z]{2,}/.test(name) && /^[A-Z]+[a-zA-Z0-9]*$/.test(name);
    }
    function isCamelCase(name) {
      return /^[a-z][a-zA-Z0-9]*$/.test(name);
    }
    function isSnakeCase(name) {
      return /_/.test(name);
    }
    function isPlural(name) {
      return /s$/.test(name) && name.length > 2;
    }
    function isBooleanPrefix(name) {
      return /^(is|has|should)[A-Z]/.test(name);
    }
    function isCollectionType(typeNode) {
      if (!typeNode) return false;
      if (typeNode.type === 'TSArrayType') return true;
      if (typeNode.type === 'TSTypeReference' && typeNode.typeName && typeNode.typeName.name) {
        return ['Array', 'Map', 'Set', 'Record'].includes(typeNode.typeName.name);
      }
      return false;
    }

    return {
      TSInterfaceDeclaration(node) {
        const name = node.id.name;

        if (!isPascalCase(name)) {
          context.report({ node: node.id, messageId: "interfacePascalCase" });
        }
        if (/^I[A-Z]/.test(name)) {
          context.report({ node: node.id, messageId: "interfaceNoIPrefix" });
        }
        if (isAllCapsAbbr(name)) {
          context.report({ node: node.id, messageId: "interfaceNoAllCaps" });
        }
        if (tooGenericNames.includes(name)) {
          context.report({ node: node.id, messageId: "interfaceNoTooGeneric", data: { name } });
        }
        if (!/^[A-Z]/.test(name)) {
          context.report({ node: node.id, messageId: "interfaceNoLowercase" });
        }
      },
      TSPropertySignature(node) {
        if (!node.key || node.key.type !== "Identifier") return;
        const name = node.key.name;

        if (!isCamelCase(name)) {
          context.report({ node: node.key, messageId: "propertyCamelCase", data: { name } });
        }
        if (isSnakeCase(name)) {
          context.report({ node: node.key, messageId: "propertyNoSnakeCase", data: { name } });
        }
        if (/^[A-Z]/.test(name)) {
          context.report({ node: node.key, messageId: "propertyNoUppercase", data: { name } });
        }
        // 布尔类型检测
        if (node.typeAnnotation && node.typeAnnotation.typeAnnotation.type === "TSBooleanKeyword") {
          if (!isBooleanPrefix(name)) {
            context.report({ node: node.key, messageId: "propertyBooleanPrefix", data: { name } });
          }
        }
        // 集合类型检测
        if (isCollectionType(node.typeAnnotation && node.typeAnnotation.typeAnnotation)) {
          if (!isPlural(name)) {
            context.report({ node: node.key, messageId: "propertyPluralCollection", data: { name } });
          }
        }
        // 缩写检测
        if (badAbbrs.includes(name)) {
          context.report({ node: node.key, messageId: "propertyNoBadAbbr", data: { name } });
        }
      }
    };
  },
};