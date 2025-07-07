 /**
 * @fileoverview Enforce enum naming conventions
 */
"use strict";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce enum naming conventions",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: null,
    schema: [],
    messages: {
      enumNameSingular: "Enum name should be in singular form, not plural.",
      enumNameNoTypeSuffix: "Enum name should not end with 'Type' or 'Types' suffix.",
      enumNameNoEnumSuffix: "Enum name should not end with 'Enum' suffix.",
      enumMemberSnakeCase: "Enum member should be in SNAKE_CASE format.",
      enumMemberUppercase: "Enum member should be in UPPERCASE format.",
    },
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const enumName = node.id.name;

        // Check for Type/Types suffix
        if (enumName.endsWith('Type') || enumName.endsWith('Types')) {
          context.report({
            node: node.id,
            messageId: 'enumNameNoTypeSuffix',
          });
        }

        // Check for Enum suffix
        if (enumName.endsWith('Enum')) {
          context.report({
            node: node.id,
            messageId: 'enumNameNoEnumSuffix',
          });
        }

        // Check for plural form (basic heuristic)
        const pluralPatterns = [
          /s$/,    // ends with 's'
          /ies$/,  // ends with 'ies'
          /es$/,   // ends with 'es'
        ];
        const isPlural = pluralPatterns.some(pattern => pattern.test(enumName));
        if (isPlural && enumName.length > 3) { // Avoid false positives for short names
          context.report({
            node: node.id,
            messageId: 'enumNameSingular',
          });
        }

        // Check enum members
        node.members.forEach(member => {
          if (member.id && member.id.type === 'Identifier') {
            const memberName = member.id.name;
            // SNAKE_CASE: 全大写+下划线
            const snakeCasePattern = /^[A-Z][A-Z0-9_]*$/;
            if (!snakeCasePattern.test(memberName)) {
              context.report({
                node: member.id,
                messageId: 'enumMemberSnakeCase',
              });
            }
            if (memberName !== memberName.toUpperCase()) {
              context.report({
                node: member.id,
                messageId: 'enumMemberUppercase',
              });
            }
          }
        });
      },
    };
  },
};