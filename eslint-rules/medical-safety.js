// Custom ESLint rules for FNTP Medical System
module.exports = {
  rules: {
    "no-medical-document-table": {
      meta: {
        type: "error",
        docs: {
          description:
            "Prevent usage of medicalDocument table - should use document table",
          category: "Possible Errors",
        },
        fixable: "code",
        schema: [],
      },
      create(context) {
        return {
          MemberExpression(node) {
            // Check for prisma.medicalDocument usage
            if (
              node.object &&
              node.object.name === "prisma" &&
              node.property &&
              node.property.name === "medicalDocument"
            ) {
              context.report({
                node,
                message:
                  "Use prisma.document instead of prisma.medicalDocument",
                fix(fixer) {
                  return fixer.replaceText(node.property, "document");
                },
              });
            }
          },
        };
      },
    },

    "no-unsafe-lab-values-access": {
      meta: {
        type: "error",
        docs: {
          description:
            "Prevent unsafe access to labValues - should use LabValue with null checks",
          category: "Possible Errors",
        },
        schema: [],
      },
      create(context) {
        return {
          MemberExpression(node) {
            // Check for document.labValues usage
            if (node.property && node.property.name === "labValues") {
              context.report({
                node,
                message:
                  "Use document.LabValue || [] instead of document.labValues",
              });
            }
          },

          CallExpression(node) {
            // Check for .find() calls without null checks
            if (
              node.callee &&
              node.callee.property &&
              node.callee.property.name === "find" &&
              node.callee.object &&
              node.callee.object.name === "labValues"
            ) {
              // Check if there's a null check in the same function
              const sourceCode = context.getSourceCode();
              const functionNode = sourceCode
                .getAncestors(node)
                .find(
                  (ancestor) =>
                    ancestor.type === "FunctionDeclaration" ||
                    ancestor.type === "ArrowFunctionExpression" ||
                    ancestor.type === "FunctionExpression"
                );

              if (functionNode) {
                const functionText = sourceCode.getText(functionNode);
                if (
                  !functionText.includes("Array.isArray") &&
                  !functionText.includes("labValues &&")
                ) {
                  context.report({
                    node,
                    message:
                      "Add null check before calling .find() on labValues: if (labValues && Array.isArray(labValues))",
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

