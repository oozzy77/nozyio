// import { nanoid } from "nanoid";

// export function traverseAndReplaceNewVarID(
//   node: Record<string, any>
// ): Record<string, any> {
//   if (typeof node !== "object" || node === null) {
//     return node;
//   }
//   if (node["var_id"] != null) {
//     return {
//       ...node,
//       var_id: nanoid(),
//     };
//   }
//   for (const key in node) {
//     const value = node[key];
//     if (Array.isArray(value)) {
//       value.forEach((item, index) => {
//         node[key][index] = traverseAndReplaceNewVarID(item);
//       });
//     } else if (typeof value === "object" && value !== null) {
//       node[key] = traverseAndReplaceNewVarID(value);
//     }
//   }
//   return node;
// }
