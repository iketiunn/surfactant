import * as soap from "soap";

export async function genAsyncMethodInterface(
  url: string,
  options?: soap.IOptions,
  endpoint?: string
) {
  return soap
    .createClientAsync(url, options, endpoint)
    .then(client => client.describe())
    .then(genInterfaceObject)
    .then(genClientAsyncInterface)
    .then(prettier);
}

interface ObjectOrString {
  [k: string]: string | ObjectOrString;
}

const ignoreKeys = ["targetNSAlias", "targetNamespace"];
function transRecursively(target: string | ObjectOrString) {
  if (typeof target === "string") {
    return transToJsType(target);
  }

  const ret: ObjectOrString = {};
  for (const k in target) {
    if (ignoreKeys.includes(k)) continue;

    if (k.includes("[]")) {
      const v = target[k];
      ret[k.replace("[]", "")] = transRecursively(v) + "[]";
    } else {
      const v = target[k];
      ret[k] = transRecursively(v);
    }
  }

  return JSON.stringify(ret).replace(/"/g, "");
}

/** TODO: More complex type support */
function transToJsType(_t: string): string {
  const [_, t] = _t.split(":");
  switch (t) {
    case "int":
    case "long":
    case "short":
    case "float":
    case "double":
      return "number";
    case "string":
    case "date":
    case "dateTime":
      return "string";
    case "boolean":
      return "boolean";
    default:
      console.error("Unknown type:", _t);
      return "string";
  }
}

interface InterfaceObject {
  name: string;
  input: string[];
  output: string[];
}
function genInterfaceObject(describe: { [k: string]: any }) {
  const serviceKey = Object.keys(describe)[0];
  const services = describe[serviceKey];
  const service = services[Object.keys(services)[0]];

  const ast = [];
  for (const mk in service) {
    const m = service[mk];
    const tmp: InterfaceObject = {
      name: mk,
      input: [],
      output: []
    };
    for (const k in m.input) {
      if (ignoreKeys.includes(k)) continue;

      const type = transRecursively(m.input[k]);
      if (k.includes("[]")) {
        tmp.input.push(`${k.replace("[]", "")}: ${type}[]`);
      } else {
        tmp.input.push(`${k}: ${type}`);
      }
    }
    for (const k in m.output) {
      if (ignoreKeys.includes(k)) continue;

      const type = transRecursively(m.output[k]);
      tmp.output.push(`${k}: ${type}`);
    }

    ast.push(tmp);
  }

  return ast;
}

function genClientAsyncInterface(objects: InterfaceObject[]) {
  const functions = objects.map(obj => {
    const arg = obj.input.length ? `arg: {${obj.input.join(";")}}` : "";
    return `${obj.name}Async: (${arg}) => Promise<[{ ${obj.output.join(
      ";"
    )} }, string, string | undefined, string]>`;
  });
  const clientInterface = `export interface ClientAsync {
  ${functions.join("\n  ")}
}`;
  return clientInterface;
}

import { format } from "prettier";
function prettier(src: string) {
  return format(src, { parser: "typescript" });
}
