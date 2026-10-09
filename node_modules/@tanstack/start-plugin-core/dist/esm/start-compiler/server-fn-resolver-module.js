//#region src/start-compiler/server-fn-resolver-module.ts
function generateServerFnResolverModule(opts) {
	const staticImports = [];
	const manifest = Object.entries(opts.serverFnsById).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([id, fn], index) => {
		const moduleRef = `serverFnModule${index}`;
		const filename = JSON.stringify(fn.extractedFilename);
		if (opts.useStaticImports) staticImports.push(`import * as ${moduleRef} from ${filename}`);
		const moduleAccess = opts.useStaticImports ? `module: ${moduleRef}` : `importer: () => import(${filename})`;
		const clientReferenced = opts.includeClientReferencedCheck ? `,\n    isClientReferenced: ${fn.isClientReferenced ?? true}` : "";
		return `'${id}': {
    functionName: '${fn.functionName}',
    ${moduleAccess}${clientReferenced}
  }`;
	}).join(",\n  ");
	const clientReferencedCheck = opts.includeClientReferencedCheck ? `
  if (access.origin === 'client' && !serverFnInfo.isClientReferenced) {
    throw new Error('Server function not accessible from client: ' + id)
  }
` : "";
	const resolveModule = opts.memoizeModules ? "serverFnInfo.module ??= await serverFnInfo.importer()" : "serverFnInfo.module ?? (await serverFnInfo.importer())";
	return `
${staticImports.join("\n")}
const manifest = {
  ${manifest}
}

export async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id]
  if (!serverFnInfo) {
    throw new Error('Server function info not found for ' + id)
  }
${clientReferencedCheck}
  const fnModule = ${resolveModule}
  if (!fnModule) {
    throw new Error('Server function module not resolved for ' + id)
  }
  const action = fnModule[serverFnInfo.functionName]
  if (!action) {
    throw new Error('Server function module export not resolved for serverFn ID: ' + id)
  }
  return action
}

`;
}
//#endregion
export { generateServerFnResolverModule };

//# sourceMappingURL=server-fn-resolver-module.js.map