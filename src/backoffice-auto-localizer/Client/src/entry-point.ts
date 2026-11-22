import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { client } from "./api/client.gen.js";

// Gives the generated client the backoffice bearer token.
export const onInit: UmbEntryPointOnInit = (host) => {
  host.consumeContext(UMB_AUTH_CONTEXT, (auth) => {
    if (!auth) return;
    const config = auth.getOpenApiConfiguration();
    client.setConfig({ baseUrl: config.base, credentials: config.credentials, auth: config.token });
  });
};

export const onUnload: UmbEntryPointOnUnload = () => {};
