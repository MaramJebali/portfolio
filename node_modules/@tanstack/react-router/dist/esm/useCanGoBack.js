import { useRouter } from "./useRouter.js";
import { isServer } from "@tanstack/router-core/isServer";
import { useSelector } from "@tanstack/react-store";
//#region src/useCanGoBack.ts
function useCanGoBack() {
	const router = useRouter();
	if (isServer ?? router.isServer) return router.stores.location.get().state.__TSR_index !== 0;
	return useSelector(router.stores.location, (location) => location.state.__TSR_index !== 0);
}
//#endregion
export { useCanGoBack };

//# sourceMappingURL=useCanGoBack.js.map